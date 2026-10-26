const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const content = require('./src/content');
const mailer = require('./src/mailer');

const app = express();
const PORT = process.env.PORT || 3000;
const ENQUIRIES_FILE = path.join(__dirname, 'data', 'enquiries.json');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));

app.get('/', (req, res) => {
  res.render('index', { ...content, year: new Date().getFullYear() });
});

function validateEnquiry(body) {
  const clean = (v, max) => String(v ?? '').trim().slice(0, max);
  const enquiry = {
    name: clean(body.name, 120),
    company: clean(body.company, 160),
    email: clean(body.email, 160),
    phone: clean(body.phone, 40),
    service: clean(body.service, 120),
    message: clean(body.message, 3000),
  };

  const errors = {};
  if (!enquiry.name) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(enquiry.email)) errors.email = 'Please enter a valid email address.';
  if (enquiry.service && !content.services.includes(enquiry.service)) errors.service = 'Please pick a service from the list.';
  if (enquiry.message.length < 10) errors.message = 'Please add a short message (at least 10 characters).';
  return { enquiry, errors };
}

async function saveEnquiry(enquiry) {
  await fs.mkdir(path.dirname(ENQUIRIES_FILE), { recursive: true });
  let list = [];
  try {
    list = JSON.parse(await fs.readFile(ENQUIRIES_FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  list.push({ ...enquiry, receivedAt: new Date().toISOString() });
  await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(list, null, 2));
}

app.post('/api/contact', async (req, res, next) => {
  // Hidden honeypot field: real visitors leave it empty.
  if (req.body.website) return res.json({ ok: true });

  const { enquiry, errors } = validateEnquiry(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  try {
    if (mailer.isConfigured()) {
      await mailer.sendEnquiry(enquiry);
    } else {
      // Local fallback. On Render's free plan this file is wiped on every restart.
      await saveEnquiry(enquiry);
    }
    console.log(`New enquiry from ${enquiry.name} <${enquiry.email}>`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).render('404', { company: content.company, year: new Date().getFullYear() });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  res.status(500).send('Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`Inventory Masters site running at http://localhost:${PORT}`);
  if (!mailer.isConfigured()) console.warn('RESEND_API_KEY not set: enquiries are saved to data/enquiries.json instead of emailed.');
});

# Inventory Masters

Website for Inventory Masters: inventory management, ERP optimisation and Lean operational excellence services. Built with Node.js, Express and EJS.

## Run it

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # restarts on file changes
```

Set `PORT` to use a different port.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content.js` | All site copy (services, pillars, roadmap, contact details). Edit text here. |
| `views/index.ejs` | The home page layout |
| `views/partials/` | Header, footer and icons |
| `public/css/styles.css` | Styles |
| `public/js/main.js` | Mobile menu, scroll animations, contact form |
| `server.js` | Express server and the `/api/contact` endpoint |

## Contact form

Enquiries are validated on the server, then emailed through [Resend](https://resend.com) (`src/mailer.js`). Render's free plan blocks outgoing SMTP, which is why it uses an HTTPS email API rather than Gmail SMTP.

| Env var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required to send email. Without it, enquiries are saved to `data/enquiries.json` (handy locally, but wiped on every Render restart). |
| `ENQUIRY_TO` | Inbox that receives enquiries. Defaults to the company email in `src/content.js`. |
| `ENQUIRY_FROM` | Sender address. Defaults to `onboarding@resend.dev`, which can only deliver to the email the Resend account was created with, until you verify your own domain in Resend. |

The visitor's email is set as Reply-To, so you can reply to an enquiry directly.

// Sends contact-form enquiries by email through Resend's HTTPS API.
// Render's free plan blocks outgoing SMTP, so plain Gmail SMTP won't work there.
//
// Env vars:
//   RESEND_API_KEY  required to send (from resend.com → API Keys)
//   ENQUIRY_TO      inbox that receives enquiries (defaults to the company email)
//   ENQUIRY_FROM    sender; onboarding@resend.dev works until a domain is verified

const content = require('./content');

const RESEND_URL = 'https://api.resend.com/emails';

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function formatEnquiry(e) {
  const lines = [
    `Name:     ${e.name}`,
    `Company:  ${e.company || '-'}`,
    `Email:    ${e.email}`,
    `Phone:    ${e.phone || '-'}`,
    `Service:  ${e.service || '-'}`,
    '',
    e.message,
  ];
  return lines.join('\n');
}

async function sendEnquiry(enquiry) {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM || 'Inventory Masters Website <onboarding@resend.dev>',
      to: [process.env.ENQUIRY_TO || content.company.email],
      reply_to: enquiry.email,
      subject: `New website enquiry from ${enquiry.name.replace(/[\r\n]+/g, ' ')}`,
      text: formatEnquiry(enquiry),
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }
}

module.exports = { isConfigured, sendEnquiry };

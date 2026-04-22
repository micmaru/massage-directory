/**
 * functions/sendAdminNotification.js
 *
 * Standalone Node.js HTTP server — sends an admin notification email via Resend
 * when a new supplier completes registration on MassageMap.
 *
 * Setup:
 *   npm install resend
 *
 * Environment variable required:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *
 * Run:
 *   node functions/sendAdminNotification.js
 *   (defaults to port 3003 — override with PORT env var)
 *
 * Endpoint:
 *   POST /send-admin-notification
 *   Content-Type: application/json
 *   Body: { supplierName, supplierType, supplierNumber, province, area, cellNumber, registeredAt }
 */

const http        = require('http');
const { Resend }  = require('resend');

const PORT        = process.env.PORT || 3003;
const resend      = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL  = 'MassageMap <onboarding@resend.dev>';
const ADMIN_EMAIL = 'hjcilliers@gmail.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function buildEmailText({ supplierName, supplierType, supplierNumber, province, area, cellNumber, registeredAt }) {
  const typeLabel = supplierType === 'spa' ? 'Spa' : 'Individual Therapist';
  const dateStr   = registeredAt
    ? new Date(registeredAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })
    : new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

  return [
    'New MassageMap Registration Received',
    '',
    `Supplier Name:   ${supplierName}`,
    `Type:            ${typeLabel}`,
    `Supplier Number: ${supplierNumber}`,
    `Province:        ${province}`,
    `Area:            ${area}`,
    `Cell Number:     ${cellNumber}`,
    `Registered:      ${dateStr}`,
    '',
    'View admin dashboard:',
    '  https://massagemap.co.za/admin.html',
    '',
    '— MassageMap Automated Notification',
  ].join('\n');
}

const server = http.createServer(async (req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send-admin-notification') {
    res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const { supplierName, supplierType, supplierNumber, province, area, cellNumber, registeredAt } = payload;

    try {
      const { data, error } = await resend.emails.send({
        from:    FROM_EMAIL,
        to:      ADMIN_EMAIL,
        subject: 'New MassageMap Registration Received',
        text:    buildEmailText({ supplierName, supplierType, supplierNumber, province, area, cellNumber, registeredAt }),
      });

      if (error) {
        console.error('Resend error:', error);
        res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Email send failed' }));
        return;
      }

      console.log(`Admin notification sent for ${supplierNumber} — id: ${data.id}`);
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, emailId: data.id }));

    } catch (err) {
      console.error('Unexpected error:', err);
      res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`sendAdminNotification listening on http://localhost:${PORT}`);
});

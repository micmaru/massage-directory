/**
 * functions/sendWelcomeEmail.js
 *
 * Standalone Node.js HTTP server — sends a welcome email via Resend
 * after a new supplier completes registration on MassageMap.
 *
 * Setup:
 *   npm install resend
 *
 * Environment variable required:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *
 * Run:
 *   node functions/sendWelcomeEmail.js
 *   (defaults to port 3002 — override with PORT env var)
 *
 * Endpoint:
 *   POST /send-welcome-email
 *   Content-Type: application/json
 *   Body: { supplierEmail, supplierName, supplierNumber, supplierType }
 */

const http   = require('http');
const { Resend } = require('resend');

const PORT       = process.env.PORT || 3002;
const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'MassageMap <notifications@massagemap.co.za>';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function buildEmailText({ supplierName, supplierNumber, supplierType }) {
  const typeLabel = supplierType === 'spa' ? 'spa' : 'therapist';
  return [
    `Hi ${supplierName},`,
    '',
    `Welcome to MassageMap! Your ${typeLabel} registration has been received.`,
    '',
    `Your membership number is:`,
    `  ${supplierNumber}`,
    '',
    'Please keep this number for your records — you will need it if you',
    'contact MassageMap support.',
    '',
    'What happens next:',
    '  1. Our team will review and verify your registration.',
    '  2. We will contact you to confirm details.',
    '  3. Once approved, your listing will appear in search results.',
    '',
    'Log in to your dashboard at any time to update your profile:',
    '  https://massagemap.co.za/dashboard.html',
    '',
    '— The MassageMap Team',
  ].join('\n');
}

const server = http.createServer(async (req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send-welcome-email') {
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

    const { supplierEmail, supplierName, supplierNumber, supplierType } = payload;

    if (!supplierEmail || !supplierName || !supplierNumber) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    try {
      const { data, error } = await resend.emails.send({
        from:    FROM_EMAIL,
        to:      supplierEmail,
        subject: `Welcome to MassageMap — your membership number is ${supplierNumber}`,
        text:    buildEmailText({ supplierName, supplierNumber, supplierType }),
      });

      if (error) {
        console.error('Resend error:', error);
        res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Email send failed' }));
        return;
      }

      console.log(`Welcome email sent to ${supplierEmail} [${supplierNumber}] — id: ${data.id}`);
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
  console.log(`sendWelcomeEmail listening on http://localhost:${PORT}`);
});

/**
 * functions/sendEnquiryEmail.js
 *
 * Standalone Node.js HTTP server — single endpoint that sends a
 * therapist notification email via Resend whenever a customer
 * submits an enquiry.
 *
 * Setup:
 *   npm install resend
 *
 * Environment variable required:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *
 * Run:
 *   node functions/sendEnquiryEmail.js
 *   (defaults to port 3001 — override with PORT env var)
 *
 * Endpoint:
 *   POST /send-enquiry-email
 *   Content-Type: application/json
 *   Body: { supplierEmail, supplierName, customerName, customerCell, customerEmail, message }
 */

const http   = require('http');
const { Resend } = require('resend');

const PORT       = process.env.PORT || 3001;
const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'MassageMap <notifications@massagemap.co.za>';

// ── CORS headers ─────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Build plain-text email body ───────────────────────────────────
function buildEmailBody({ supplierName, customerName, customerCell, customerEmail, message }) {
  return [
    `Hi ${supplierName},`,
    '',
    `You have a new enquiry from ${customerName}.`,
    '',
    `Cell:    ${customerCell}`,
    `Email:   ${customerEmail || 'Not provided'}`,
    '',
    'Message:',
    message,
    '',
    'Log in to your MassageMap dashboard to respond.',
    '',
    '— The MassageMap Team',
  ].join('\n');
}

// ── Request handler ───────────────────────────────────────────────
const server = http.createServer(async (req, res) => {

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send-enquiry-email') {
    res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Parse JSON body
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

    const { supplierEmail, supplierName, customerName, customerCell, customerEmail, message } = payload;

    // Basic validation
    if (!supplierEmail || !supplierName || !customerName || !customerCell || !message) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    try {
      const { data, error } = await resend.emails.send({
        from:    FROM_EMAIL,
        to:      supplierEmail,
        subject: 'New enquiry on MassageMap',
        text:    buildEmailBody({ supplierName, customerName, customerCell, customerEmail, message }),
      });

      if (error) {
        console.error('Resend error:', error);
        res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || 'Email send failed' }));
        return;
      }

      console.log(`Email sent to ${supplierEmail} — id: ${data.id}`);
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
  console.log(`sendEnquiryEmail listening on http://localhost:${PORT}`);
});

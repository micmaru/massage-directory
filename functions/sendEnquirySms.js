/**
 * functions/sendEnquirySms.js
 *
 * Placeholder SMS notification endpoint.
 *
 * TODO: Replace the simulated send below with a real SMS provider before launch.
 *       Recommended SA-compatible providers:
 *         - Clickatell  — https://www.clickatell.com
 *         - BulkSMS     — https://www.bulksms.com
 *         - Vonage      — https://developer.vonage.com
 *
 * Setup:
 *   No extra dependencies — uses Node built-ins only (until a real provider is added).
 *
 * Run (alongside sendEnquiryEmail.js or separately):
 *   node functions/sendEnquirySms.js
 *   (defaults to port 3002 — override with PORT env var)
 *
 * Endpoint:
 *   POST /send-enquiry-sms
 *   Content-Type: application/json
 *   Body: { supplierCell, supplierName, customerName, customerCell, message }
 */

const http = require('http');

const PORT = process.env.SMS_PORT || 3002;

// ── CORS headers ─────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Build SMS text ────────────────────────────────────────────────
function buildSmsText({ supplierName, customerName, customerCell, message }) {
  const preview = message.length > 80 ? message.slice(0, 77) + '…' : message;
  return `MassageMap: Hi ${supplierName}, new enquiry from ${customerName} (${customerCell}). "${preview}" — log in to respond.`;
}

// ── Request handler ───────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/send-enquiry-sms') {
    res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const { supplierCell, supplierName, customerName, customerCell, message } = payload;

    if (!supplierCell || !supplierName || !customerName || !customerCell || !message) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    const smsText = buildSmsText({ supplierName, customerName, customerCell, message });

    // ── SIMULATED SEND ────────────────────────────────────────────
    // Replace this block with a real SMS provider API call before launch.
    // Example with BulkSMS:
    //   const response = await fetch('https://api.bulksms.com/v1/messages', {
    //     method: 'POST',
    //     headers: { Authorization: 'Basic ' + btoa(`${USER}:${PASS}`), 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ to: supplierCell, body: smsText }),
    //   });
    // ─────────────────────────────────────────────────────────────
    console.log('[SMS SIMULATED]');
    console.log(`  To:      ${supplierCell}`);
    console.log(`  Message: ${smsText}`);

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, simulated: true }));
  });
});

server.listen(PORT, () => {
  console.log(`sendEnquirySms listening on http://localhost:${PORT}`);
});

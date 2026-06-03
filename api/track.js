// Vercel serverless function — Meta Conversions API relay.
// Receives event_name + event_id (and optional event data) from the browser,
// enriches with server-only signals (client IP, User-Agent), and POSTs to
// https://graph.facebook.com/v18.0/{pixel-id}/events for server-side coverage.
// Meta dedupes against the browser pixel on (event_name, event_id).

const crypto = require('crypto');

const PIXEL_ID = process.env.META_PIXEL_ID || '389596963559117';
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ACCESS_TOKEN) {
    console.error('META_CAPI_TOKEN is not set');
    return res.status(500).json({ error: 'CAPI not configured' });
  }

  try {
    const body = req.body || {};
    const { event_name, event_id } = body;

    if (!event_name || !event_id) {
      return res.status(400).json({ error: 'event_name and event_id required' });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded
      ? String(forwarded).split(',')[0].trim()
      : (req.headers['x-real-ip'] || req.socket?.remoteAddress || '');
    const userAgent = req.headers['user-agent'] || '';

    const userData = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };
    if (body.fbp) userData.fbp = body.fbp;
    if (body.fbc) userData.fbc = body.fbc;
    if (body.external_id) userData.external_id = sha256(body.external_id);

    const customData = {};
    if (body.currency) customData.currency = body.currency;
    if (typeof body.value !== 'undefined') customData.value = body.value;
    if (body.content_ids) customData.content_ids = body.content_ids;
    if (body.content_name) customData.content_name = body.content_name;
    if (body.content_type) customData.content_type = body.content_type;

    const eventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: 'website',
      event_source_url: body.event_source_url || req.headers.referer || '',
      user_data: userData,
    };
    if (Object.keys(customData).length) eventData.custom_data = customData;

    const payload = { data: [eventData] };
    if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const fbRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const fbBody = await fbRes.json();
    if (!fbRes.ok) {
      console.error('Meta CAPI rejected:', fbBody);
      return res.status(502).json({ error: 'CAPI rejected', meta: fbBody });
    }

    return res.status(200).json({ ok: true, events_received: fbBody.events_received });
  } catch (err) {
    console.error('CAPI handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};

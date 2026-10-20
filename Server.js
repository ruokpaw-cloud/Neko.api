// Server-side check for ANOTHER website's backend (Node 18+, Express example).
// This is the part that really protects your content: the browser gate in
// neko-key.js can be bypassed by anyone who edits the page, a server check cannot.

const NEKO_API = process.env.NEKO_API || 'https://YOUR-SERVER.example.com';

async function checkKey(key, user) {
  try {
    const r = await fetch(`${NEKO_API}/check?key=${encodeURIComponent(key)}&user=${encodeURIComponent(user)}`);
    return await r.json();            // { ok, project, permanent, expires, users, max } | { ok:false, reason }
  } catch (e) {
    return { ok: false, reason: 'network' };
  }
}

// Express middleware: send the key and user name in headers (or query)
async function requireKey(req, res, next) {
  const key = req.get('x-key') || req.query.key || '';
  const user = req.get('x-user') || req.query.user || '';
  const r = await checkKey(String(key), String(user));
  if (!r.ok) return res.status(403).json({ error: r.reason });
  req.nekoKey = r;
  next();
}

// Usage:
//   const express = require('express');
//   const app = express();
//   app.get('/private-data', requireKey, (req, res) => res.json({ secret: 'only for valid keys' }));

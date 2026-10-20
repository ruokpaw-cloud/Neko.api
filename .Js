'use strict';
// Neko API Key server - zero dependencies (Node 18+)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';                 // REQUIRED for /api/*
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, ''); // e.g. https://neko-api.onrender.com
const ORIGINS = (process.env.ORIGIN || '*').split(',').map(x => x.trim()).filter(Boolean); // website URL(s) allowed to call the API (CORS), comma separated
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const SRC_FILE = process.env.SRC_FILE || path.join(__dirname, 'src.lua');
const MAX_USERS = parseInt(process.env.MAX_USERS || '0', 10) || 0; // 0 = unlimited users per key

let db = { project: null };
try { db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) {}
function save() { const t = DATA_FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, DATA_FILE); }

// ---- tiny rate limiter (per IP, per minute) ----
const hits = new Map();
function limited(ip, max) {
  const n = Date.now(), h = hits.get(ip) || { c: 0, t: n };
  if (n - h.t > 60000) { h.c = 0; h.t = n; }
  h.c++; hits.set(ip, h); return h.c > max;
}
setInterval(() => { const n = Date.now(); for (const [k, v] of hits) if (n - v.t > 120000) hits.delete(k); }, 60000).unref();

// ---- helpers ----
function send(res, code, body, type) {
  const h = {
    'Content-Type': type || 'text/plain; charset=utf-8',

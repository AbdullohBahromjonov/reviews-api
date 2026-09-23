// Optional local server: node server.js
//   GET http://localhost:3000/reviews            -> Accept-Language negotiated
//   GET http://localhost:3000/reviews?lang=ja    -> explicit language
//   GET http://localhost:3000/languages          -> list of available languages
const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_LANG = 'en';
const dir = path.join(__dirname, 'reviews');
const locales = new Map(
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'index.json')
    .map((f) => [path.basename(f, '.json'), fs.readFileSync(path.join(dir, f), 'utf8')])
);
const index = fs.readFileSync(path.join(dir, 'index.json'), 'utf8');

// Case-insensitive lookup, plus region fallback: pt-BR -> pt, zh -> zh-Hans.
const byLower = new Map([...locales.keys()].map((k) => [k.toLowerCase(), k]));
byLower.set('zh', 'zh-Hans');

function resolve(tag) {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  return byLower.get(lower) || byLower.get(lower.split('-')[0]) || null;
}

function negotiate(header) {
  return (header || '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag, q: q ? parseFloat(q.split('=')[1]) : 1 };
    })
    .filter((e) => e.tag && e.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((e) => resolve(e.tag))
    .find(Boolean);
}

function send(res, status, body, lang) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    Vary: 'Accept-Language',
  };
  if (lang) headers['Content-Language'] = lang;
  res.writeHead(status, headers);
  res.end(body);
}

http
  .createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, JSON.stringify({ error: 'Method not allowed' }));
    }

    const url = new URL(req.url, 'http://localhost');
    const route = url.pathname.replace(/\/+$/, '') || '/';

    if (route === '/languages') return send(res, 200, index);

    if (route === '/reviews' || route === '/reviews.json') {
      const requested = url.searchParams.get('lang');
      const lang = requested
        ? resolve(requested)
        : negotiate(req.headers['accept-language']) || DEFAULT_LANG;

      if (!lang) {
        return send(
          res,
          404,
          JSON.stringify({
            error: `Unsupported language: ${requested}`,
            available: [...locales.keys()],
          })
        );
      }
      return send(res, 200, locales.get(lang), lang);
    }

    send(res, 404, JSON.stringify({ error: 'Not found' }));
  })
  .listen(3000, () => console.log('GET http://localhost:3000/reviews?lang=fr'));

// Optional local server: node server.js  ->  http://localhost:3000/reviews
const http = require('http');
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8');

http
  .createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
    if (url === '/reviews' || url === '/reviews.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      return res.end(data);
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  })
  .listen(3000, () => console.log('GET http://localhost:3000/reviews'));

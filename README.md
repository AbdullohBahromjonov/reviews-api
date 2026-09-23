# Reviews API

A tiny read-only JSON endpoint that returns app reviews. The data is a single static
file, served over HTTPS by GitHub Pages, so there is nothing to deploy or keep running.

## Endpoint

```
GET https://AbdullohBahromjonov.github.io/reviews-api/reviews.json
```

Responds with `application/json` and `Access-Control-Allow-Origin: *`, so it can be
fetched directly from a browser or app.

### Response shape

```json
{
  "count": 4,
  "reviews": [
    {
      "id": 1,
      "title": "…",
      "rating": 5,
      "body": "…",
      "author": "[Name]"
    }
  ]
}
```

### Example

```js
const { reviews } = await fetch(
  'https://AbdullohBahromjonov.github.io/reviews-api/reviews.json'
).then((r) => r.json());
```

```sh
curl -s https://AbdullohBahromjonov.github.io/reviews-api/reviews.json
```

## Editing the data

Edit `reviews.json` and push to `main`. GitHub Pages redeploys in about a minute.
Keep `count` in sync with the number of entries.

## Running it locally

An optional Node server is included if you want a real HTTP route instead of a file:

```sh
node server.js   # GET http://localhost:3000/reviews
```

It has no dependencies and requires Node 18 or newer.

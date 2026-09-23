# Reviews API

A read-only JSON endpoint that returns app reviews, localized into ten languages.
Each language is a static file served over HTTPS by GitHub Pages, so there is nothing
to deploy or keep running.

Base URL: `https://abdullohbahromjonov.github.io/reviews-api/`

## Endpoints

```
GET reviews/{lang}.json    reviews in one language
GET reviews/index.json     the list of available languages
GET reviews.json           English, kept as the default
```

Responses are `application/json; charset=utf-8` with `Access-Control-Allow-Origin: *`,
so they can be fetched straight from a browser or an app.

### Languages

| `lang` | Language |
| --- | --- |
| `en` | English |
| `fr` | Français |
| `es` | Español |
| `de` | Deutsch |
| `sv` | Svenska |
| `nl` | Nederlands |
| `zh-Hans` | 简体中文 |
| `el` | Ελληνικά |
| `ja` | 日本語 |
| `vi` | Tiếng Việt |

### Response shape

Every language returns the same structure, with matching `id` and `rating` values, so
the reviews line up across locales.

```json
{
  "language": "fr",
  "name": "Français",
  "count": 4,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "title": "…",
      "body": "…",
      "author": "[Nom]"
    }
  ]
}
```

### Choosing a language

GitHub Pages serves static files and cannot read `Accept-Language`, so the caller picks
the file. Fall back to `en` for anything unsupported, and strip the region from a tag
such as `de-AT` before trying again.

```js
const BASE = 'https://abdullohbahromjonov.github.io/reviews-api';
const SUPPORTED = ['en', 'fr', 'es', 'de', 'sv', 'nl', 'zh-Hans', 'el', 'ja', 'vi'];

function pick(tag) {
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh')) return 'zh-Hans';
  return SUPPORTED.find((l) => l.toLowerCase() === lower)
    ?? SUPPORTED.find((l) => l === lower.split('-')[0])
    ?? 'en';
}

const lang = pick(navigator.language);
const { reviews } = await fetch(`${BASE}/reviews/${lang}.json`).then((r) => r.json());
```

```sh
curl -s https://abdullohbahromjonov.github.io/reviews-api/reviews/ja.json
```

## Running it locally

An optional Node server is included if you want real content negotiation instead of a
plain file. It has no dependencies and needs Node 18 or newer.

```sh
node server.js
```

```
GET /reviews                 negotiated from the Accept-Language header
GET /reviews?lang=ja         explicit language; 404 with a list if unsupported
GET /languages               the list of available languages
```

It also accepts region subtags (`de-AT` resolves to `de`) and `zh` (resolves to
`zh-Hans`), and sets `Content-Language` and `Vary: Accept-Language` on every response.

## Editing the data

Edit the file under `reviews/` and push to `main`; GitHub Pages redeploys in about a
minute. Keep `count` in sync with the number of entries, keep the `id` values aligned
across languages, and copy `reviews/en.json` over `reviews.json` when English changes.
Adding a language means adding `reviews/<tag>.json` and an entry in `reviews/index.json`.

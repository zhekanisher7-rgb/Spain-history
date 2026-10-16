# Historia de España — History of Spain

Production-quality static website on the military and political history of Spain (wars, revolutions, battles), with a Habsburg / Golden Age visual theme.

**Repository:** [github.com/zhekanisher7-rgb/Spain-history](https://github.com/zhekanisher7-rgb/Spain-history)

## Stack

- Semantic HTML5, modern CSS (custom properties), vanilla JavaScript
- Multi-page static site (no build step)
- i18n: **RU** (default) / **ES** / **EN** via `data/i18n-*.json` and `data-i18n` attributes
- Interactive timeline, client-side search, empire map viewer (pan/zoom)

## Run locally

From the site root (`spain-history/`):

```bash
# Option A — Node
npx serve .

# Option B — Python
python3 -m http.server 8080
```

Then open `http://localhost:3000` (serve) or `http://localhost:8080` (Python).

> Static file APIs (`fetch` for JSON/SVG) need an HTTP server; opening `index.html` as `file://` may break i18n, timeline, search, and maps.

## Structure

```
spain-history/
  index.html              # Home + interactive timeline
  css/                    # main, timeline, maps
  js/                     # main, i18n, timeline, search, maps
  data/                   # timeline.json, i18n-ru/es/en.json
  pages/                  # Era, war, figures, maps pages
  maps/                   # empire-1550/1580/1780/1898/1975.svg
  assets/heraldry.svg
```

## Maps

SVG world maps use Natural Earth 110m coastlines. Spanish control is approximated with modern country polygons plus custom shapes for historical enclaves (Milan, Naples/Sicily, Louisiana, presidios). Extents are educational approximations, not cadastral boundaries.

## License / tone

Educational project. Neutral academic tone. Casualty figures given as ranges or historiographic estimates only.

[![Deploy](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml)

# michalkulbacki.com

Personal website.
Built with [Eleventy](https://www.11ty.dev/), a very small static site generator.
`src/` is the source, `site/` is the built, published output and is not committed.

## Layout

| Path | What it is |
| --- | --- |
| `src/index.html` | home page, Polish |
| `src/en/index.html` | home page, English |
| `src/_includes/base.njk` | shared page layout: head, analytics, footer wiring |
| `src/_includes/analytics.njk` | the PostHog snippet, single source of truth for every page |
| `src/static/` | shared stylesheets, scripts and the Latin Modern font files |
| `src/stave-generator/` | blank stave paper generator |
| `src/golden-chord/` | golden ratio chord calculator |
| `src/tension-fader/` | slider potentiometer data recorder, with a PWA and a chart view |
| `src/receipt-tracker/` | local receipt tracker with OCR |
| `src/sitemap.xml`, `src/robots.txt` | for search engines; add new pages to the sitemap by hand |
| `scripts/inject-analytics.js` | postbuild step: adds the PostHog snippet to the vendored tool pages |

The two home pages are content-only, wrapped in the shared layout at build time; only their front matter (language, description, canonical URL) differs.
Everything under `src/static/` and the four tool directories above is vendored or generated elsewhere and is copied into `site/` unchanged, never templated.
`npm run build` then runs `scripts/inject-analytics.js` as a postbuild step, which inserts the same PostHog snippet into those vendored pages too (skipping any page that already has it), so analytics only ever need editing in one place: `src/_includes/analytics.njk`.

## Working on it

Install dependencies once:

```bash
npm install
```

Build the site:

```bash
npm run build
```

Or serve it locally with live reload:

```bash
npm run serve
```

Then open <http://localhost:8080/> and <http://localhost:8080/en/>.

Run the same check CI runs:

```bash
npm run build
npx --yes html-validate@11 site/index.html site/en/index.html
```

## Deployment

Every push to `main` deploys to dhosting over SSH.
See [`.github/github-README.md`](.github/github-README.md) for the workflow, the required secrets and the one-time setup.

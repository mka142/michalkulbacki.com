[![Deploy](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml)

# michalkulbacki.com

Personal website.
Hand-written static HTML, no build step: `site/` is the published site, byte for byte.

## Layout

| Path | What it is |
| --- | --- |
| `site/index.html` | home page, Polish |
| `site/en/index.html` | home page, English |
| `site/static/` | shared stylesheets, analytics scripts and the Latin Modern font files |
| `site/stave-generator/` | blank stave paper generator |
| `site/golden-chord/` | golden ratio chord calculator |
| `site/tension-fader/` | slider potentiometer data recorder, with a PWA and a chart view |
| `site/receipt-tracker/` | local receipt tracker with OCR |

The two home pages are kept in sync by hand.
Change one and change the other.

## Working on it

Serve the site locally:

```bash
cd site && python3 -m http.server 8000
```

Then open <http://localhost:8000/> and <http://localhost:8000/en/>.

Run the same check CI runs:

```bash
npx --yes html-validate@11 site/index.html site/en/index.html
```

## Deployment

Every push to `main` deploys to dhosting over SSH.
See [`.github/github-README.md`](.github/github-README.md) for the workflow, the required secrets and the one-time setup.

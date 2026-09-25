#!/usr/bin/env node
// Runs after the Eleventy build (npm postbuild hook). The two hand-written
// pages already get the PostHog snippet from src/_includes/base.njk; this
// adds it to the vendored tool pages too, which are copied into site/
// unchanged and never templated. Idempotent: skips any page that already
// has it.
'use strict';

const fs = require('fs');
const path = require('path');

const snippet = fs
  .readFileSync(path.join(__dirname, '..', 'src', '_includes', 'analytics.njk'), 'utf8')
  .replace(/^\{#-[\s\S]*?-#\}\n/, '');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.html')) {
      inject(full);
    }
  }
}

function inject(file) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('posthog.init(') || !html.includes('</head>')) return;
  fs.writeFileSync(file, html.replace('</head>', `${snippet}  </head>`));
}

walk(path.join(__dirname, '..', 'site'));

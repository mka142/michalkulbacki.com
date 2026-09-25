module.exports = function (eleventyConfig) {
  // Vendored apps and static assets are copied through untouched: passed
  // through verbatim, and excluded from template processing so nothing in
  // their markup is ever mistaken for Nunjucks syntax.
  const passthroughOnly = [
    "src/static",
    "src/golden-chord/**",
    "src/receipt-tracker/**",
    "src/stave-generator/**",
    "src/tension-fader/**",
    "src/favicon.ico",
    "src/favicon-16x16.png",
    "src/favicon-32x32.png",
    "src/apple-touch-icon.png",
    "src/android-chrome-192x192.png",
    "src/android-chrome-512x512.png",
    "src/site.webmanifest",
    "src/about.txt",
  ];
  for (const path of passthroughOnly) {
    eleventyConfig.addPassthroughCopy(path);
    eleventyConfig.ignores.add(path);
  }

  eleventyConfig.setTemplateFormats(["html"]);

  return {
    dir: {
      input: "src",
      output: "site",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
  };
};

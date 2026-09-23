// PostHog, trimmed to page views and clicks on links.
// Loaded after https://eu-assets.i.posthog.com/static/array.js, which defines window.posthog.
// Nothing is stored on the visitor's device (memory persistence), so no cookie banner is needed.
// The deploy workflow swaps the placeholder for the POSTHOG_PROJECT_KEY secret,
// so a local copy of the site never sends anything.
const POSTHOG_PROJECT_KEY = "__POSTHOG_PROJECT_KEY__";

if (!POSTHOG_PROJECT_KEY.startsWith("__")) {
  posthog.init(POSTHOG_PROJECT_KEY, {
    api_host: "https://eu.i.posthog.com",
    defaults: "2026-05-30",
    persistence: "memory",
    capture_pageview: true,
    capture_pageleave: false,
    autocapture: {
      dom_event_allowlist: ["click"],
      element_allowlist: ["a"],
    },
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
  });
}

// This Service Worker is intentionally left empty to prevent caching during development.
// In production, a proper Service Worker for caching and offline capabilities would be implemented.

self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  self.skipWaiting(); // Activate new service worker as soon as it's installed
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
  event.waitUntil(clients.claim()); // Take control of all clients
});

self.addEventListener("fetch", (event) => {
  // Do nothing, effectively bypassing the cache
});

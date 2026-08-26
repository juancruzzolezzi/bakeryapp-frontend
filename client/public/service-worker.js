// Service worker mínimo: cachea el "cascarón" de la app (HTML, ícono) para
// que abra más rápido en visitas repetidas y cumpla el requisito técnico
// para que el navegador ofrezca "Instalar app". No cachea las llamadas a
// la API (/products, etc.): esas siempre van a la red, para no mostrar
// productos/precios desactualizados.
const CACHE_NAME = "bakery-app-shell-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/un-pan.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo navegación de páginas y assets propios (mismo origen); todo lo
  // demás (API del backend, fuentes de Google, etc.) pasa de largo.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

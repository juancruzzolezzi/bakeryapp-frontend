// Service worker mínimo: cachea el "cascarón" de la app (HTML, ícono) para
// que abra más rápido en visitas repetidas y cumpla el requisito técnico
// para que el navegador ofrezca "Instalar app". No cachea las llamadas a
// la API (/products, etc.): esas siempre van a la red, para no mostrar
// productos/precios desactualizados.
// "v2" (no "v1"): fuerza a que cualquiera que ya tenga el service worker
// viejo instalado tire su caché anterior y arranque de cero con la nueva
// estrategia de navegación (red primero), en vez de seguir arrastrando el
// comportamiento viejo indefinidamente.
const CACHE_NAME = "bakery-app-shell-v2";
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

  // La navegación (el HTML de la página en sí) va primero a la red, con
  // el caché solo como respaldo si no hay conexión. Antes iba caché
  // primero como todo lo demás, y después de publicar una versión nueva
  // eso podía servir un HTML viejo apuntando a archivos JS con hashes que
  // ya no existen en el servidor (ver React.lazy en App.js) — pantalla en
  // blanco hasta que alguien refrescara a mano. El resto de los assets
  // (JS/CSS con hash en el nombre) no tiene este problema: un cambio de
  // contenido es directamente una URL distinta, así que ahí sigue
  // sirviendo de caché al toque y actualizando en segundo plano.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
    );
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

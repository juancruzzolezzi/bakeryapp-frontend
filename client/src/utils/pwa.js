// Detecta si el sitio se está corriendo como app instalada (PWA), en vez de
// en el navegador normal. "navigator.standalone" es la forma vieja de
// detectarlo en iOS; el resto de los navegadores usan el media query.
export const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

// iOS Safari nunca dispara "beforeinstallprompt" (ver usePwaInstall.js):
// ahí no hay botón posible, solo instrucciones manuales (compartir ->
// agregar a inicio).
export const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

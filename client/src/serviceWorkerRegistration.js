// Registra public/service-worker.js: necesario para que el navegador
// considere el sitio "instalable" (Chrome/Edge en Android y desktop). En
// desarrollo (localhost sin HTTPS de por medio) los service workers
// igual funcionan, así que no hace falta distinguir por entorno.
export const registerServiceWorker = () => {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .catch((error) => {
                console.error("No se pudo registrar el service worker:", error);
            });
    });
};

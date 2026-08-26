import { useEffect, useState } from "react";

// Cualquier componente que use este hook (Home.jsx, InstallAppBanner.jsx)
// recibe el mismo evento nativo del navegador cuando está disponible: cada
// uno guarda su propia referencia, pero apuntan al mismo "beforeinstallprompt"
// que dispara el navegador una sola vez por carga de página.
export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const handleBeforeInstall = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setCanInstall(true);
        };

        const handleInstalled = () => {
            setCanInstall(false);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    //Devuelve true si se instaló, false si el usuario canceló o no había
    //nada para instalar (ej: ya la tiene, o el navegador no lo soporta).
    const promptInstall = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setCanInstall(false);
        return outcome === "accepted";
    };

    return { canInstall, promptInstall };
}

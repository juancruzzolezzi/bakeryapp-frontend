import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isStandalone } from "../../utils/pwa";
import styles from "./InstallAppBanner.module.css";

const INSTALLED_KEY = "appInstalada";

const esIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const InstallAppBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    // No se persiste: el pedido es que este aviso aparezca cada vez que se
    // abra la web, así que cerrarlo solo lo oculta para esta visita, no
    // para siempre (a diferencia de INSTALLED_KEY, que sí es permanente).
    const [cerrado, setCerrado] = useState(false);
    const [yaInstalada, setYaInstalada] = useState(
        () => localStorage.getItem(INSTALLED_KEY) === "1"
    );
    const user = useSelector((state) => state.authSlice.user);

    useEffect(() => {
        if (isStandalone()) return;

        const handleBeforeInstall = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setVisible(true);
        };

        const handleInstalled = () => {
            localStorage.setItem(INSTALLED_KEY, "1");
            setYaInstalada(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);

        // Chrome/Edge avisan con "beforeinstallprompt" (arriba). iOS Safari
        // nunca dispara ese evento, así que ahí se muestran instrucciones
        // manuales en vez de un botón que dependa de ese evento.
        if (esIOS()) setVisible(true);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cerrar = () => {
        setCerrado(true);
    };

    const instalar = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            localStorage.setItem(INSTALLED_KEY, "1");
            setYaInstalada(true);
        }
        setDeferredPrompt(null);
    };

    // Registrarse/iniciar sesión es una función solo de la app instalada
    // (ver AccountButton.jsx), no de la web. Si ya está instalada, el
    // aviso solo tiene que recordarle que abra la app para tener el 10%.
    if (cerrado) return null;
    if (!visible && !yaInstalada) return null;
    if (isStandalone()) return null;

    return (
        <div className={styles.banner}>
            {yaInstalada ? (
                <>
                    <span className={styles.icon} aria-hidden="true">
                        🎉
                    </span>
                    <div className={styles.text}>
                        <p className={styles.title}>¡Gracias por instalar la app!</p>
                        <p className={styles.subtitle}>
                            {/* No hay una forma confiable de abrir desde la web
                                una app ya instalada (los navegadores no dejan
                                que una página lance otra app): hay que
                                abrirla desde su propio ícono. */}
                            {user
                                ? "Abrila desde su ícono (pantalla de inicio o menú de apps) para seguir comprando con tu 10% OFF."
                                : "Abrila desde su ícono (pantalla de inicio o menú de apps) e iniciá sesión para tener 10% OFF en toda la tienda."}
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <span className={styles.icon} aria-hidden="true">
                        📲
                    </span>
                    <div className={styles.text}>
                        <p className={styles.title}>Instalá la app</p>
                        <p className={styles.subtitle}>
                            {esIOS()
                                ? "Tocá compartir (⬆️) y elegí \"Agregar a inicio\"."
                                : "Se instala directo desde el navegador, sin tiendas de apps."}
                        </p>
                    </div>
                    {!esIOS() && (
                        <button onClick={instalar} className={styles.primaryBtn}>
                            Instalar
                        </button>
                    )}
                </>
            )}
            <button onClick={cerrar} className={styles.closeBtn} aria-label="Cerrar">
                ✕
            </button>
        </div>
    );
};

export default InstallAppBanner;

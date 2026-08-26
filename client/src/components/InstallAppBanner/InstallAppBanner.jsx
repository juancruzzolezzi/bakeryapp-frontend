import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { isStandalone, isIOS } from "../../utils/pwa";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import styles from "./InstallAppBanner.module.css";

const INSTALLED_KEY = "appInstalada";

const InstallAppBanner = () => {
    const { canInstall, promptInstall } = usePwaInstall();
    const [visible, setVisible] = useState(false);
    // No se persiste: el pedido es que este aviso aparezca cada vez que se
    // abra la web, así que cerrarlo solo lo oculta para esta visita, no
    // para siempre (a diferencia de INSTALLED_KEY, que sí es permanente).
    const [cerrado, setCerrado] = useState(false);
    const [yaInstalada, setYaInstalada] = useState(
        () => localStorage.getItem(INSTALLED_KEY) === "1"
    );
    const user = useSelector((state) => state.authSlice.user);
    const bannerRef = useRef(null);
    //El "gracias por instalar" (ver "yaInstalada" más abajo) solo tiene
    //que verse en el home: en cualquier otra página, aunque se refresque,
    //no debe aparecer.
    const location = useLocation();
    const enHome = location.pathname === "/";

    useEffect(() => {
        if (isStandalone()) return;

        const handleInstalled = () => {
            localStorage.setItem(INSTALLED_KEY, "1");
            setYaInstalada(true);
        };

        window.addEventListener("appinstalled", handleInstalled);

        // Chrome/Edge avisan con "beforeinstallprompt" (ver usePwaInstall.js
        // y "canInstall" más abajo). iOS Safari nunca dispara ese evento,
        // así que ahí se muestran instrucciones manuales en vez de un botón.
        if (isIOS()) setVisible(true);

        return () => window.removeEventListener("appinstalled", handleInstalled);
    }, []);

    //Apenas el navegador ofrece el evento de instalación (ver "canInstall"),
    //se muestra el aviso aunque no haya pasado nada más todavía.
    useEffect(() => {
        if (canInstall) setVisible(true);
    }, [canInstall]);

    //Se cierra igual que el resto de los paneles del sitio (Cart.jsx,
    //NavBarHome.jsx): con un click en cualquier lado de afuera, no solo
    //con la cruz.
    useEffect(() => {
        if (cerrado || (!visible && !yaInstalada)) return;

        const handleClickOutside = (event) => {
            if (bannerRef.current && bannerRef.current.contains(event.target)) return;
            setCerrado(true);
        };

        document.addEventListener("click", handleClickOutside, true);
        return () => document.removeEventListener("click", handleClickOutside, true);
    }, [cerrado, visible, yaInstalada]);

    const cerrar = () => {
        setCerrado(true);
    };

    const instalar = async () => {
        const instalada = await promptInstall();
        if (instalada) {
            localStorage.setItem(INSTALLED_KEY, "1");
            setYaInstalada(true);
        }
    };

    // Registrarse/iniciar sesión es una función solo de la app instalada
    // (ver AccountButton.jsx), no de la web. Si ya está instalada, el
    // aviso solo tiene que recordarle que abra la app para tener el 10%.
    if (cerrado) return null;
    if (isStandalone()) return null;
    if (yaInstalada) {
        if (!enHome) return null;
    } else if (!visible) {
        return null;
    }

    return (
        <div className={styles.banner} ref={bannerRef}>
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
                            {isIOS()
                                ? "Tocá compartir (⬆️) y elegí \"Agregar a inicio\"."
                                : "Se instala directo desde el navegador, sin tiendas de apps."}
                        </p>
                    </div>
                    {!isIOS() && (
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

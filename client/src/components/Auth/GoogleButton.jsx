import React, { useEffect, useRef } from "react";

// Carga (una sola vez) el script de Google Identity Services y renderiza el
// botón oficial "Continuar con Google". Cuando el usuario elige una cuenta,
// Google nos devuelve un "credential" (ID token JWT) que le pasamos a
// onCredential para mandarlo al backend.
const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

let scriptPromise = null;
const loadGis = () => {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = GIS_SRC;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return scriptPromise;
};

const GoogleButton = ({ onCredential, onError }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!CLIENT_ID) return;
        let cancelled = false;

        loadGis()
            .then(() => {
                if (cancelled || !containerRef.current) return;
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: (response) => onCredential(response.credential),
                });
                window.google.accounts.id.renderButton(containerRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    width: 280,
                });
            })
            .catch(() => onError?.("No se pudo cargar el ingreso con Google"));

        return () => {
            cancelled = true;
        };
    }, [onCredential, onError]);

    if (!CLIENT_ID) return null;

    return <div ref={containerRef} style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }} />;
};

export default GoogleButton;

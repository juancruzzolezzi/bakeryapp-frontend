import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

// Un solo componente para todas las confirmaciones cortas del sitio
// (agregado al carrito, favorito, link copiado, etc.), en vez de que cada
// una resuelva su propio aviso por separado.
export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const timeoutRef = useRef(null);

    const showToast = useCallback((message, icon = "") => {
        setToast({ message, icon });
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setToast(null), 2200);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div
                className={`${styles.toast} ${toast ? styles.show : ""}`}
                role="status"
                aria-live="polite"
            >
                {toast && (
                    <>
                        <span className={styles.icon} aria-hidden="true">
                            {toast.icon}
                        </span>
                        <span>{toast.message}</span>
                    </>
                )}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>");
    }
    return context;
};

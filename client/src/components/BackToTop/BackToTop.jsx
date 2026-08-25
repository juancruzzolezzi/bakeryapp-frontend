import React, { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

// Sirve tanto para páginas que scrollean en el "window" (Products, Home)
// como para las que tienen su propio contenedor interno con scroll
// (Nosotros, Contactanos, PreguntasFrecuentes): si se pasa "containerRef",
// escucha y scrollea ese elemento en vez del window.
//
// Solo se muestra una vez que te alejaste un poco del principio (no
// "siempre que haya scroll posible"): si ya estás arriba de todo, volver
// arriba no tiene sentido.
const BackToTop = ({ containerRef, threshold = 150 }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const target = containerRef?.current || window;
        const getScrollTop = () =>
            containerRef?.current
                ? containerRef.current.scrollTop
                : window.scrollY;

        const handleScroll = () => {
            setVisible(getScrollTop() > threshold);
        };

        target.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => target.removeEventListener("scroll", handleScroll);
    }, [containerRef, threshold]);

    const scrollToTop = () => {
        const target = containerRef?.current || window;
        target.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={`${styles.backToTop} ${visible ? styles.visible : ""}`}
            aria-label="Volver arriba"
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
        >
            ↑
        </button>
    );
};

export default BackToTop;

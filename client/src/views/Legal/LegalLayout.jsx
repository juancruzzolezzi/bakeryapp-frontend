import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";
import { LEGAL } from "../../constants/legal";
import styles from "./Legal.module.css";

const PAGINAS_LEGALES = [
    { to: "/terminos", label: "Términos" },
    { to: "/privacidad", label: "Privacidad" },
    { to: "/cambios-y-devoluciones", label: "Cambios y devoluciones" },
    { to: "/arrepentimiento", label: "Botón de arrepentimiento" },
];

// Estructura común de las páginas legales: pestañas para pasar de una a
// otra, un índice armado solo a partir de los <h2> del texto (con el que
// se está leyendo resaltado) y un "En resumen" opcional arriba.
const LegalLayout = ({ titulo, intro, resumen, children, mostrarFecha = true }) => {
    const articleRef = useRef(null);
    const [secciones, setSecciones] = useState([]);
    const [activa, setActiva] = useState(null);

    // Los títulos salen del propio texto, así el índice nunca queda
    // desactualizado si se agrega o cambia una sección.
    useEffect(() => {
        const titulos = Array.from(articleRef.current?.querySelectorAll("h2") || []);
        titulos.forEach((h, i) => {
            h.id = `seccion-${i + 1}`;
        });
        setSecciones(titulos.map((h) => ({ id: h.id, texto: h.textContent })));
        if (!titulos.length) return undefined;

        // Resalta en el índice la última sección cuyo título ya pasó el
        // 40% de la pantalla (la que se está leyendo); arriba de todo, la
        // primera. Se recalcula como mucho una vez por frame al scrollear.
        let raf = null;
        const actualizar = () => {
            raf = null;
            const limite = window.innerHeight * 0.4;
            let actual = titulos[0];
            titulos.forEach((h) => {
                if (h.getBoundingClientRect().top <= limite) actual = h;
            });
            setActiva(actual.id);
        };
        const onScroll = () => {
            if (raf === null) raf = requestAnimationFrame(actualizar);
        };
        actualizar();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf !== null) cancelAnimationFrame(raf);
        };
    }, [titulo]);

    const conIndice = secciones.length >= 3;

    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.page}>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>Legal</p>
                    <h1 className={styles.title}>{titulo}</h1>
                    <nav className={styles.tabs} aria-label="Páginas legales">
                        {PAGINAS_LEGALES.map((p) => (
                            <NavLink
                                key={p.to}
                                to={p.to}
                                className={({ isActive }) =>
                                    `${styles.tab} ${isActive ? styles.tabOn : ""}`
                                }
                            >
                                {p.label}
                            </NavLink>
                        ))}
                    </nav>
                </header>

                <div className={`${styles.layout} ${conIndice ? "" : styles.layoutSolo}`}>
                    {conIndice && (
                        <nav className={styles.toc} aria-label="En esta página">
                            <span className={styles.tocTitle}>En esta página</span>
                            {secciones.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className={`${styles.tocLink} ${activa === s.id ? styles.tocLinkOn : ""}`}
                                    onClick={(e) => {
                                        // Scroll suave sin tocar el hash (el router
                                        // usa la URL y no hace falta ensuciarla).
                                        e.preventDefault();
                                        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    {s.texto}
                                </a>
                            ))}
                        </nav>
                    )}

                    <article className={styles.article} ref={articleRef}>
                        {mostrarFecha && (
                            <p className={styles.updatedInline}>
                                Última actualización: {LEGAL.ultimaActualizacion}
                            </p>
                        )}
                        {intro && <p className={styles.intro}>{intro}</p>}
                        {resumen && (
                            <div className={styles.summary}>
                                <strong>En resumen</strong>
                                <ul>
                                    {resumen.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {children}
                    </article>
                </div>

                <Footer />
            </div>

            <BackToTop />
        </div>
    );
};

export default LegalLayout;

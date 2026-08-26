import React from "react";
import styles from "./Nosotros.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";

// TODO: ajustar según lo que realmente distinga al local
const DIFERENCIADORES = [
    {
        titulo: "Horneado diario",
        texto: "Nada de stock de días anteriores.",
    },
    {
        titulo: "Ingredientes locales",
        texto: "Apoyamos productores de la zona.",
    },
    {
        titulo: "Pedidos por WhatsApp",
        texto: "Respuesta rápida, sin vueltas.",
    },
    {
        titulo: "Opciones para todos",
        texto: "Sin TACC y veganas disponibles.",
    },
];

const Nosotros = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.sectionContainer}>
                <div className={styles.pageContent}>
                <div className={styles.intro}>
                    <h1>Sobre Nosotros</h1>
                    <p>
                        Bienvenidos a nuestra bakery, donde cada día horneamos con amor y
                        dedicación para compartir dulces momentos con nuestra comunidad.
                    </p>
                </div>

                {/* TODO: reemplazar por las cifras reales del local */}
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>8+</span>
                        <span className={styles.statLabel}>Años horneando</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>+35</span>
                        <span className={styles.statLabel}>Productos</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>2 mil+</span>
                        <span className={styles.statLabel}>Clientes felices</span>
                    </div>
                </div>

                <div className={styles.checklist}>
                    {DIFERENCIADORES.map((item) => (
                        <div key={item.titulo} className={styles.checkItem}>
                            <span className={styles.checkIcon}>✓</span>
                            <div className={styles.checkText}>
                                <h4>{item.titulo}</h4>
                                <p>{item.texto}</p>
                            </div>
                        </div>
                    ))}
                </div>
                </div>

                <Footer />
            </div>

            <BackToTop />
        </div>
    );
};

export default Nosotros;

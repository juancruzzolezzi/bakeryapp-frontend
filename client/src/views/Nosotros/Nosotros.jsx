import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Nosotros.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";
import { DIFERENCIALES } from "../../constants/diferenciales";
import { CONTACTO } from "../../constants/contacto";

// TODO: reemplazar por las cifras reales del local.
const CIFRAS = [
    { numero: "8+", texto: "Años horneando" },
    { numero: "+35", texto: "Productos" },
    { numero: "2 mil+", texto: "Clientes felices" },
];

// TODO: confirmar los años y los textos reales de la historia del local.
const HISTORIA = [
    {
        anio: "2016",
        titulo: "Formación en Gato Dumas",
        texto: "El equipo aprende la técnica profesional que hoy sale en cada receta.",
    },
    {
        anio: "2018",
        titulo: "El primer horno",
        texto: "Los primeros pedidos para el barrio y las recetas que hoy son clásicos de la casa.",
    },
    {
        anio: "2020",
        titulo: "Abrimos en Belgrano",
        texto: "El local de Zavalía 2026, con café de especialidad y lugar para tu mascota.",
    },
    {
        anio: "Hoy",
        titulo: "Tienda online",
        texto: "Pedís desde el celular y te lo llevamos, o lo retirás en el local.",
    },
];

const PROCESO = [
    {
        imagen: "/Portada.jpg",
        alt: "Panes recién horneados en una canasta",
        titulo: "Amasamos de madrugada",
        texto: "Masas con tiempo de levado y manteca de verdad, como aprendimos en la escuela.",
    },
    {
        imagen: "/img/Tarta.jpeg",
        alt: "Porción de torta de chocolate",
        titulo: "Horneamos cada mañana",
        texto: "Todo lo que ves en la vitrina y en la web sale del horno ese mismo día.",
    },
    {
        imagen: "/img/Cookies.jpeg",
        alt: "Cookies de chocolate",
        titulo: "Te lo llevamos o lo servimos",
        texto: "Delivery en Belgrano y alrededores, o en el local con un café de especialidad.",
    },
];

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CONTACTO.direccion
)}`;

const Nosotros = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.page}>
                <section className={styles.hero}>
                    <div className={styles.heroText}>
                        <p className={styles.eyebrow}>Nosotros</p>
                        <h1 className={styles.title}>
                            De la escuela Gato Dumas <em>a tu mesa</em>
                        </h1>
                        <p>
                            Somos una pastelería artesanal en Belgrano. Nuestro equipo se
                            formó en el Instituto Gato Dumas y cada mañana hornea todo lo que
                            ofrecemos, para acompañarlo con café de especialidad.
                        </p>
                        <p>
                            Empezamos horneando para amigos y vecinos del barrio. Hoy, más de
                            8 años después, seguimos con la misma receta de siempre: buena
                            materia prima, tiempo y mucho oficio.
                        </p>
                    </div>
                    <div className={styles.collage}>
                        <img
                            src="/img/medialunas.jpg"
                            alt="Medialunas recién horneadas"
                            className={`${styles.polaroid} ${styles.polaroidMain}`}
                        />
                        <img
                            src="/img/cafe.jpg"
                            alt="Café de especialidad con arte latte"
                            className={`${styles.polaroid} ${styles.polaroidSide}`}
                            loading="lazy"
                        />
                    </div>
                </section>

                <section className={styles.stats} aria-label="Bakery en números">
                    {CIFRAS.map((c) => (
                        <div key={c.texto} className={styles.stat}>
                            <span className={styles.statNum}>{c.numero}</span>
                            <span className={styles.statLabel}>{c.texto}</span>
                        </div>
                    ))}
                </section>

                <section className={styles.section} aria-labelledby="historia">
                    <p className={styles.eyebrow}>Nuestra historia</p>
                    <h2 id="historia" className={styles.sectionTitle}>Cómo llegamos hasta acá</h2>
                    <ol className={styles.timeline}>
                        {HISTORIA.map((h, i) => (
                            <li key={h.titulo} className={styles.step}>
                                <span className={styles.stepDot} aria-hidden="true">{i + 1}</span>
                                <span className={styles.stepYear}>{h.anio}</span>
                                <h3>{h.titulo}</h3>
                                <p>{h.texto}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={styles.section} aria-labelledby="distingue">
                    <p className={styles.eyebrow}>Lo que nos distingue</p>
                    <h2 id="distingue" className={styles.sectionTitle}>Por qué elegirnos</h2>
                    <ul className={styles.values}>
                        {DIFERENCIALES.map((item) => (
                            <li key={item.titulo} className={styles.value}>
                                <span className={styles.valueIcon} aria-hidden="true">
                                    <FontAwesomeIcon icon={item.icono} />
                                </span>
                                <div>
                                    <h3>{item.titulo}</h3>
                                    <p>{item.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.section} aria-labelledby="proceso">
                    <p className={styles.eyebrow}>Cómo trabajamos</p>
                    <h2 id="proceso" className={styles.sectionTitle}>
                        Del horno <em>a tu mesa</em>
                    </h2>
                    <ol className={styles.process}>
                        {PROCESO.map((p, i) => (
                            <li key={p.titulo} className={styles.processCard}>
                                <div className={styles.processPhoto}>
                                    <img src={p.imagen} alt={p.alt} loading="lazy" />
                                    <span className={styles.processNum} aria-hidden="true">{i + 1}</span>
                                </div>
                                <div className={styles.processBody}>
                                    <h3>{p.titulo}</h3>
                                    <p>{p.texto}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={styles.cta}>
                    <div>
                        <h2>Vení a conocernos</h2>
                        <p>{CONTACTO.direccion} · {CONTACTO.horario}</p>
                    </div>
                    <div className={styles.ctaActions}>
                        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={styles.ctaDark}>
                            Cómo llegar
                        </a>
                        <Link to="/products" className={styles.ctaOutline}>
                            Hacer un pedido
                        </Link>
                    </div>
                </section>

                <Footer />
            </div>

            <BackToTop />
        </div>
    );
};

export default Nosotros;

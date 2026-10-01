import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import styles from "./PreguntasFrecuentes.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import Footer from "../../components/Footer/Footer";
import BackToTop from "../../components/BackToTop/BackToTop";
import { CONTACTO } from "../../constants/contacto";
import {
    DELIVERY_ZONES,
    DELIVERY_FEE,
    FREE_SHIPPING_THRESHOLD,
} from "../../constants/deliveryZones";

const formatearPrecio = (monto) => `$${monto.toLocaleString("es-AR")}`;

const CATEGORIAS = ["Pedidos", "Envíos", "Pagos", "Productos", "Cambios"];

// "respuesta" puede ser texto o JSX (para las que llevan links o chips);
// "texto" es la versión en texto plano que usa el buscador.
// TODO: revisar el contenido cuando esté todo definido.
const FAQS = [
    {
        categoria: "Pedidos",
        pregunta: "¿Cómo hago un pedido?",
        texto: "Elegí tus productos en Productos, tocá Mi pedido y pagá con Mercado Pago. También podés coordinar por WhatsApp desde el carrito.",
        respuesta: (
            <>
                Elegí tus productos en <Link to="/products">Productos</Link>, tocá “Mi
                pedido” y pagá con Mercado Pago. Si preferís, también podés coordinar por
                WhatsApp desde el carrito.
            </>
        ),
    },
    {
        categoria: "Pedidos",
        pregunta: "¿Con cuánta anticipación tengo que pedir?",
        texto: "Recomendamos pedir con al menos 48 hs de anticipación, especialmente para tortas o pedidos personalizados.",
    },
    {
        categoria: "Pedidos",
        pregunta: "¿Puedo personalizar mi pedido?",
        texto: "¡Por supuesto! Contanos qué tenés en mente por WhatsApp y lo armamos juntos. Para eventos, usá el formulario de Contactanos.",
        respuesta: (
            <>
                ¡Por supuesto! Contanos qué tenés en mente por WhatsApp y lo armamos
                juntos. Para eventos, usá el formulario de{" "}
                <Link to="/contactanos">Contactanos</Link>.
            </>
        ),
    },
    {
        categoria: "Envíos",
        pregunta: "¿A qué zonas hacen delivery?",
        texto: `Hacemos delivery a ${DELIVERY_ZONES.join(", ")}. El envío cuesta ${formatearPrecio(
            DELIVERY_FEE
        )} y es gratis desde ${formatearPrecio(FREE_SHIPPING_THRESHOLD)}.`,
        respuesta: (
            <>
                <span className={styles.zones}>
                    {DELIVERY_ZONES.map((zona) => (
                        <span key={zona} className={styles.zone}>{zona}</span>
                    ))}
                </span>
                El envío cuesta {formatearPrecio(DELIVERY_FEE)} y es gratis en compras
                desde {formatearPrecio(FREE_SHIPPING_THRESHOLD)}. Al pagar elegís tu
                barrio y te avisamos antes de cobrar si no llegamos. Si estás fuera de
                zona, podés retirar en el local.
            </>
        ),
    },
    {
        categoria: "Envíos",
        pregunta: "¿Puedo retirar en el local?",
        texto: `Sí. Al pagar elegí Take Away y retiralo sin costo en ${CONTACTO.direccion}, ${CONTACTO.horario}.`,
    },
    {
        categoria: "Pagos",
        pregunta: "¿Qué formas de pago aceptan?",
        texto: "Los pedidos de la web se pagan online con Mercado Pago: tarjetas de crédito y débito, dinero en cuenta y los demás medios que Mercado Pago tenga disponibles. No hace falta tener cuenta de Mercado Pago para pagar con tarjeta.",
    },
    {
        categoria: "Pagos",
        pregunta: "¿Hay algún descuento?",
        texto: "Sí: si creás una cuenta en la app de Bakery, tenés 10% de descuento en toda la tienda, aplicado automáticamente al pagar.",
    },
    {
        categoria: "Productos",
        pregunta: "¿Qué alérgenos tienen los productos?",
        texto: "Elaboramos todo en la misma cocina, donde se usan harina de trigo, huevo, leche y derivados, frutos secos, maní y soja, por lo que cualquier producto puede contener trazas. Las opciones sin TACC y veganas se preparan con ingredientes aptos, pero si tenés celiaquía o una alergia severa, escribinos por WhatsApp antes de pedir y te contamos cómo se elabora cada producto.",
    },
    {
        categoria: "Cambios",
        pregunta: "¿Puedo cambiar o devolver un producto?",
        texto: "Por tratarse de alimentos frescos, no aceptamos cambios por gusto una vez entregado el pedido. Si algo llegó en mal estado o no es lo que pediste, avisanos dentro de las 24 hs y lo reponemos o te devolvemos el dinero. También podés cancelar tu compra con el botón de arrepentimiento.",
        respuesta: (
            <>
                Por tratarse de alimentos frescos, no aceptamos cambios por gusto una vez
                entregado el pedido. Si algo llegó en mal estado o no es lo que pediste,
                avisanos dentro de las 24 hs y lo reponemos o te devolvemos el dinero.
                También podés cancelar tu compra con el{" "}
                <Link to="/arrepentimiento">botón de arrepentimiento</Link>. Todos los
                detalles en nuestra{" "}
                <Link to="/cambios-y-devoluciones">política de cambios y devoluciones</Link>.
            </>
        ),
    },
];

//El buscador no distingue mayúsculas ni acentos.
const normalizar = (texto) =>
    texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

const PreguntasFrecuentes = () => {
    //Todas las preguntas arrancan cerradas.
    const [abierta, setAbierta] = useState(null);
    const [categoria, setCategoria] = useState("Todas");
    const [busqueda, setBusqueda] = useState("");

    const toggle = (pregunta) =>
        setAbierta((prev) => (prev === pregunta ? null : pregunta));

    const grupos = useMemo(() => {
        const texto = normalizar(busqueda.trim());
        const visibles = FAQS.filter(
            (faq) =>
                (categoria === "Todas" || faq.categoria === categoria) &&
                (!texto || normalizar(`${faq.pregunta} ${faq.texto}`).includes(texto))
        );
        return CATEGORIAS.map((cat) => [cat, visibles.filter((faq) => faq.categoria === cat)]).filter(
            ([, lista]) => lista.length > 0
        );
    }, [categoria, busqueda]);

    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.page}>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>Ayuda</p>
                    <h1 className={styles.title}>
                        ¿En qué te <em>ayudamos?</em>
                    </h1>
                    <label className={styles.search}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscá: envíos, alérgenos, pagos…"
                            aria-label="Buscar en las preguntas frecuentes"
                        />
                    </label>
                    <div className={styles.chips} role="group" aria-label="Filtrar por tema">
                        {["Todas", ...CATEGORIAS].map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`${styles.chip} ${categoria === cat ? styles.chipOn : ""}`}
                                onClick={() => setCategoria(cat)}
                                aria-pressed={categoria === cat}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                <div className={styles.layout}>
                    <div className={styles.groups}>
                        {grupos.length === 0 && (
                            <p className={styles.empty}>
                                No encontramos preguntas sobre “{busqueda}”. Escribinos por
                                WhatsApp y te respondemos.
                            </p>
                        )}

                        {grupos.map(([cat, lista]) => (
                            <section key={cat} aria-labelledby={`faq-${cat}`}>
                                <h2 id={`faq-${cat}`} className={styles.groupTitle}>{cat}</h2>
                                {lista.map((faq) => {
                                    const isOpen = abierta === faq.pregunta;
                                    const idRespuesta = `resp-${FAQS.indexOf(faq)}`;
                                    return (
                                        <div key={faq.pregunta} className={styles.item}>
                                            <button
                                                type="button"
                                                className={styles.question}
                                                onClick={() => toggle(faq.pregunta)}
                                                aria-expanded={isOpen}
                                                aria-controls={idRespuesta}
                                            >
                                                <span>{faq.pregunta}</span>
                                                <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`} aria-hidden="true">+</span>
                                            </button>
                                            <div
                                                id={idRespuesta}
                                                className={`${styles.answer} ${isOpen ? styles.answerOpen : ""}`}
                                            >
                                                <p>{faq.respuesta || faq.texto}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        ))}
                    </div>

                    <aside className={styles.aside}>
                        <div className={styles.helpCard}>
                            <h2>¿No encontraste tu respuesta?</h2>
                            <p>
                                Escribinos y te contestamos en el horario del local (
                                {CONTACTO.horario}).
                            </p>
                            <a
                                href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.helpBtn}
                            >
                                <FontAwesomeIcon icon={faWhatsapp} /> Escribinos por WhatsApp
                            </a>
                        </div>
                        <nav className={styles.linksCard} aria-label="Páginas relacionadas">
                            <span>También te puede servir</span>
                            <Link to="/cambios-y-devoluciones">Cambios y devoluciones →</Link>
                            <Link to="/arrepentimiento">Botón de arrepentimiento →</Link>
                            <Link to="/terminos">Términos y condiciones →</Link>
                        </nav>
                    </aside>
                </div>

                <Footer />
            </div>

            <BackToTop />
        </div>
    );
};

export default PreguntasFrecuentes;

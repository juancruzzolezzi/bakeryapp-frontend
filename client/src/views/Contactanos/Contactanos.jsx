import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import styles from "./Contactanos.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import BackToTop from "../../components/BackToTop/BackToTop";
import Footer from "../../components/Footer/Footer";
import { CONTACTO } from "../../constants/contacto";
import { estaAbiertoAhora, detalleHorario, NOMBRES_DIAS } from "../../utils/horarioLocal";

//Lunes primero (getDay() arranca en domingo = 0).
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CONTACTO.direccion
)}`;

const TIPOS_EVENTO = ["Torta", "Mesa dulce", "Catering", "Otro"];

const Contactanos = () => {
    const ahora = new Date();
    const abierto = estaAbiertoAhora(CONTACTO.horarioAtencion, ahora);
    const detalle = detalleHorario(CONTACTO.horarioAtencion, ahora);
    const { dias, abre, cierra } = CONTACTO.horarioAtencion;
    const hoy = ahora.getDay();

    //Formulario de eventos: no se manda a ningún servidor, arma el mensaje
    //y abre WhatsApp con todo ya escrito (es por donde se coordina todo).
    const [evento, setEvento] = useState({
        nombre: "",
        fecha: "",
        personas: "",
        tipo: TIPOS_EVENTO[0],
        mensaje: "",
    });
    const [errorEvento, setErrorEvento] = useState("");

    const actualizar = (campo) => (e) =>
        setEvento((prev) => ({ ...prev, [campo]: e.target.value }));

    const enviarEvento = (e) => {
        e.preventDefault();
        if (!evento.nombre.trim() || !evento.fecha) {
            setErrorEvento("Completá tu nombre y la fecha del evento.");
            return;
        }
        setErrorEvento("");
        const fecha = new Date(`${evento.fecha}T12:00:00`).toLocaleDateString("es-AR");
        const lineas = [
            "Hola! Quiero consultar por un evento:",
            `Nombre: ${evento.nombre.trim()}`,
            `Fecha: ${fecha}`,
            evento.personas && `Personas: ${evento.personas}`,
            `Necesito: ${evento.tipo}`,
            evento.mensaje.trim() && `Detalle: ${evento.mensaje.trim()}`,
        ].filter(Boolean);
        window.open(
            `https://wa.me/${CONTACTO.whatsappNumero}?text=${encodeURIComponent(lineas.join("\n"))}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.page}>
                <section className={styles.hero}>
                    <div className={styles.heroMain}>
                        <p className={styles.eyebrow}>Contacto</p>
                        <h1 className={styles.title}>
                            Hablemos. <em>Te respondemos rápido.</em>
                        </h1>
                        <span
                            className={`${styles.status} ${
                                abierto ? styles.statusOpen : styles.statusClosed
                            }`}
                        >
                            <span className={styles.statusDot} />
                            {abierto ? "Abierto ahora" : "Cerrado ahora"}
                            {detalle && ` · ${detalle}`}
                        </span>

                        <a
                            className={styles.whatsappCard}
                            href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className={styles.whatsappIcon}>
                                <FontAwesomeIcon icon={faWhatsapp} />
                            </span>
                            <span className={styles.whatsappText}>
                                <strong>Escribinos por WhatsApp</strong>
                                <span>{CONTACTO.whatsappTexto} · pedidos, dudas o encargos</span>
                            </span>
                            <span className={styles.whatsappBtn}>Abrir chat →</span>
                        </a>

                        <div className={styles.secondary}>
                            <a
                                className={styles.contactRow}
                                href={CONTACTO.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FontAwesomeIcon icon={faInstagram} className={styles.rowIcon} />
                                <span className={styles.rowText}>
                                    <span className={styles.rowLabel}>Instagram</span>
                                    <strong>@{CONTACTO.instagramUser}</strong>
                                </span>
                            </a>
                            <a
                                className={styles.contactRow}
                                href={`mailto:${CONTACTO.email}`}
                            >
                                <FontAwesomeIcon icon={faEnvelope} className={styles.rowIcon} />
                                <span className={styles.rowText}>
                                    <span className={styles.rowLabel}>Email</span>
                                    <strong>{CONTACTO.email}</strong>
                                </span>
                            </a>
                        </div>
                    </div>

                    <aside className={styles.hours} aria-labelledby="horarios">
                        <h2 id="horarios" className={styles.hoursTitle}>Horarios</h2>
                        <ul className={styles.hoursList}>
                            {ORDEN_SEMANA.map((dia) => {
                                const abreEseDia = dias.includes(dia);
                                return (
                                    <li
                                        key={dia}
                                        className={`${styles.dayRow} ${dia === hoy ? styles.dayToday : ""}`}
                                    >
                                        <span>
                                            {NOMBRES_DIAS[dia]}
                                            {dia === hoy && " · hoy"}
                                        </span>
                                        <span className={abreEseDia ? "" : styles.dayClosed}>
                                            {abreEseDia ? `${abre} a ${cierra} hs` : "Cerrado"}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                </section>

                <section className={styles.local} aria-labelledby="el-local">
                    <iframe
                        title={`Mapa: ${CONTACTO.direccion}`}
                        className={styles.map}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                            CONTACTO.direccion + ", CABA"
                        )}&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className={styles.localText}>
                        <p className={styles.eyebrowDark}>El local</p>
                        <h2 id="el-local" className={styles.localTitle}>
                            <FontAwesomeIcon icon={faLocationDot} /> {CONTACTO.direccion}
                        </h2>
                        <p>
                            Vení a tomar un café de especialidad con algo recién horneado.
                            Somos pet-friendly: tu mascota es bienvenida.
                        </p>
                        <div className={styles.localActions}>
                            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={styles.darkBtn}>
                                Cómo llegar
                            </a>
                            <Link to="/products" className={styles.outlineDarkBtn}>
                                Retirar un pedido
                            </Link>
                        </div>
                    </div>
                </section>

                <section className={styles.events} aria-labelledby="eventos">
                    <div className={styles.eventsText}>
                        <p className={styles.eyebrow}>Eventos</p>
                        <h2 id="eventos" className={styles.eventsTitle}>
                            Tortas y mesas dulces para tu celebración
                        </h2>
                        <p>
                            Contanos qué necesitás y te pasamos una propuesta por WhatsApp.
                            Pedí con al menos 48 hs de anticipación.
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={enviarEvento} noValidate>
                        <label className={styles.field}>
                            Nombre
                            <input type="text" value={evento.nombre} onChange={actualizar("nombre")} placeholder="Tu nombre" autoComplete="name" />
                        </label>
                        <label className={styles.field}>
                            Fecha del evento
                            <input type="date" value={evento.fecha} onChange={actualizar("fecha")} />
                        </label>
                        <label className={styles.field}>
                            Personas
                            <input type="number" min="1" value={evento.personas} onChange={actualizar("personas")} placeholder="Ej: 20" />
                        </label>
                        <label className={styles.field}>
                            ¿Qué necesitás?
                            <select value={evento.tipo} onChange={actualizar("tipo")}>
                                {TIPOS_EVENTO.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </label>
                        <label className={`${styles.field} ${styles.fieldFull}`}>
                            Mensaje
                            <textarea value={evento.mensaje} onChange={actualizar("mensaje")} placeholder="Sabores, temática, alergias…" />
                        </label>
                        {errorEvento && (
                            <p className={styles.formError} role="alert">{errorEvento}</p>
                        )}
                        <button type="submit" className={styles.formBtn}>
                            <FontAwesomeIcon icon={faWhatsapp} /> Enviar por WhatsApp
                        </button>
                    </form>
                </section>

                <Footer />
            </div>

            <BackToTop />
        </div>
    );
};

export default Contactanos;

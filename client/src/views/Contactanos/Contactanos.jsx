import React from "react";
import styles from "./Contactanos.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInstagram,
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
    faEnvelope,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

// TODO: reemplazar mail y teléfono por los datos reales del local cuando estén disponibles
const CONTACTO = {
    instagramUser: "bakery.oficial",
    instagramUrl: "https://www.instagram.com/bakery.oficial",
    whatsappNumero: "5491100000000", // Placeholder, actualizar con el número real
    whatsappTexto: "+54 9 11 0000-0000",
    email: "contactobakery@gmail.com", // Placeholder, actualizar con el mail real
    direccion: "Zavalía 2026, Belgrano",
};

const Contactanos = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.sectionContainer}>
                <div className={styles.textContainer}>
                    <section className={styles.section1}>
                        <h1>Contactanos</h1>
                        <p>
                            ¿Tenés dudas, un pedido especial o querés hacernos
                            llegar tu consulta? Encontranos en nuestras redes,
                            escribinos o visitanos en el local.
                        </p>
                    </section>

                    <section className={styles.linksGrid}>
                        <a
                            className={styles.contactBtn}
                            href={CONTACTO.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon
                                icon={faInstagram}
                                className={styles.icon}
                            />
                            <div className={styles.btnText}>
                                <span className={styles.btnLabel}>Instagram</span>
                                <span className={styles.btnValue}>
                                    @{CONTACTO.instagramUser}
                                </span>
                            </div>
                        </a>

                        <a
                            className={styles.contactBtn}
                            href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon
                                icon={faWhatsapp}
                                className={styles.icon}
                            />
                            <div className={styles.btnText}>
                                <span className={styles.btnLabel}>WhatsApp</span>
                                <span className={styles.btnValue}>
                                    {CONTACTO.whatsappTexto}
                                </span>
                            </div>
                        </a>

                        <a
                            className={styles.contactBtn}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACTO.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon
                                icon={faEnvelope}
                                className={styles.icon}
                            />
                            <div className={styles.btnText}>
                                <span className={styles.btnLabel}>Email</span>
                                <span className={styles.btnValue}>
                                    {CONTACTO.email}
                                </span>
                            </div>
                        </a>

                        <a
                            className={styles.contactBtn}
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                CONTACTO.direccion
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon
                                icon={faLocationDot}
                                className={styles.icon}
                            />
                            <div className={styles.btnText}>
                                <span className={styles.btnLabel}>Dirección</span>
                                <span className={styles.btnValue}>
                                    {CONTACTO.direccion}
                                </span>
                            </div>
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Contactanos;

import React from "react";
import styles from "./Contactanos.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import BackToTop from "../../components/BackToTop/BackToTop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInstagram,
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
    faEnvelope,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { CONTACTO } from "../../constants/contacto";
import { estaAbiertoAhora } from "../../utils/horarioLocal";

const Contactanos = () => {
    const abierto = estaAbiertoAhora(CONTACTO.horarioAtencion);

    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.sectionContainer}>
                <div className={styles.pageContent}>
                <div className={styles.intro}>
                    <h1>Contactanos</h1>
                    <p>
                        ¿Tenés dudas, un pedido especial o querés hacernos
                        llegar tu consulta? Encontranos en nuestras redes,
                        escribinos o visitanos en el local.
                    </p>
                    <span
                        className={`${styles.statusBadge} ${
                            abierto ? styles.statusOpen : styles.statusClosed
                        }`}
                    >
                        <span className={styles.statusDot} />
                        {abierto ? "Abierto ahora" : "Cerrado ahora"}
                    </span>
                </div>

                <div className={styles.layout}>
                    {/* WhatsApp como vía principal: es la forma más rápida de
                        coordinar un pedido, así que se destaca como bloque
                        grande en vez de quedar igualada al resto. */}
                    <a
                        className={styles.mainCard}
                        href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className={styles.mainIcon}>
                            <FontAwesomeIcon icon={faWhatsapp} />
                        </div>
                        <h2>Escribinos por WhatsApp</h2>
                        <p>
                            La forma más rápida de coordinar tu pedido o
                            resolver cualquier duda.
                        </p>
                        <span className={styles.mainBtn}>Abrir chat →</span>
                    </a>

                    <div className={styles.secondaryList}>
                        <a
                            className={styles.contactRow}
                            href={CONTACTO.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={styles.rowIcon}>
                                <FontAwesomeIcon icon={faInstagram} />
                            </div>
                            <div className={styles.rowText}>
                                <span className={styles.rowLabel}>Instagram</span>
                                <span className={styles.rowValue}>
                                    @{CONTACTO.instagramUser}
                                </span>
                            </div>
                        </a>

                        <a
                            className={styles.contactRow}
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACTO.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={styles.rowIcon}>
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>
                            <div className={styles.rowText}>
                                <span className={styles.rowLabel}>Email</span>
                                <span className={styles.rowValue}>
                                    {CONTACTO.email}
                                </span>
                            </div>
                        </a>

                        <a
                            className={styles.contactRow}
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                CONTACTO.direccion
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={styles.rowIcon}>
                                <FontAwesomeIcon icon={faLocationDot} />
                            </div>
                            <div className={styles.rowText}>
                                <span className={styles.rowLabel}>Dirección</span>
                                <span className={styles.rowValue}>
                                    {CONTACTO.direccion}
                                </span>
                            </div>
                        </a>
                    </div>
                </div>
                </div>
            </div>

            <BackToTop />
        </div>
    );
};

export default Contactanos;

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { CONTACTO } from "../../constants/contacto";
import styles from "./Footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.col}>
                    <h3 className={styles.brand}>Bakery</h3>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            CONTACTO.direccion
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {CONTACTO.direccion}
                    </a>
                </div>

                <div className={styles.col}>
                    <h4>Contacto</h4>
                    <a
                        href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                    </a>
                    <a
                        href={CONTACTO.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FontAwesomeIcon icon={faInstagram} /> Instagram
                    </a>
                    <Link to="/contactanos">Ver todos los contactos</Link>
                </div>

                <div className={styles.col}>
                    <h4>Horarios</h4>
                    <p>{CONTACTO.horario}</p>
                    <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
                </div>
            </div>

            <div className={styles.bottom}>
                © {new Date().getFullYear()} Bakery — todos los derechos reservados
            </div>
        </footer>
    );
};

export default Footer;

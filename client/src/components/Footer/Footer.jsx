import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { CONTACTO } from "../../constants/contacto";
import { DEFENSA_CONSUMIDOR_URL } from "../../constants/legal";
import styles from "./Footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer} data-print-hide>
            <div className={styles.inner}>
                <div className={styles.col}>
                    <h3 className={styles.brand}>Bakery</h3>
                    <p>Pastelería artesanal, horneada en el día.</p>
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            CONTACTO.direccion
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {CONTACTO.direccion}
                    </a>
                    {/* Botón de arrepentimiento (Res. 424/2020): tiene que
                        estar visible y a un click en todas las páginas, por
                        eso va en el footer (que está en todas) y con forma de
                        botón, no como un link más de la lista. */}
                    <Link to="/arrepentimiento" className={styles.arrepentimientoBtn}>
                        Botón de arrepentimiento
                    </Link>
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

                <div className={styles.col}>
                    <h4>Legal</h4>
                    <Link to="/terminos">Términos y condiciones</Link>
                    <Link to="/privacidad">Política de privacidad</Link>
                    <Link to="/cambios-y-devoluciones">Cambios y devoluciones</Link>
                    <a
                        href={DEFENSA_CONSUMIDOR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.defensaLink}
                    >
                        {/* Es la leyenda obligatoria (ver DEFENSA_CONSUMIDOR_URL):
                            no se le pueden sacar palabras, pero en dos renglones
                            chicos ocupa mucho menos lugar. */}
                        <span className={styles.defensaLabel}>
                            Defensa de las y los Consumidores.
                        </span>
                        <span className={styles.defensaAction}>Para reclamos ingrese aquí</span>
                    </a>
                </div>
            </div>

            <div className={styles.bottom}>
                © {new Date().getFullYear()} Bakery — todos los derechos reservados
            </div>
        </footer>
    );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import { MODO_DEMO } from "../../constants/demo";
import styles from "./DemoBanner.module.css";

// Franja de arriba de todo, en todas las páginas: aclara que el sitio es un
// proyecto académico y que no se vende nada de verdad (ver constants/demo.js).
// Va en el flujo normal de la página (no fija), así no tapa los menús.
const DemoBanner = () => {
    if (!MODO_DEMO) return null;

    return (
        <div className={styles.banner} role="note" data-print-hide>
            <span aria-hidden="true">🎓</span>
            <p className={styles.text}>
                <strong>Proyecto académico.</strong> Bakery es una tienda ficticia: no se
                venden productos ni se cobra nada.{" "}
                <Link to="/terminos" className={styles.link}>Más info</Link>
            </p>
        </div>
    );
};

export default DemoBanner;

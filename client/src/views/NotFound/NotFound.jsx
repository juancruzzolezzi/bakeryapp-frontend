import React from "react";
import { Link } from "react-router-dom";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import styles from "./NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.sectionContainer}>
                <div className={styles.content}>
                    <p className={styles.code}>404</p>
                    <h1>No encontramos esta página</h1>
                    <p className={styles.text}>
                        El link puede estar mal escrito o la página ya no existe.
                        Volvé al inicio o mirá nuestros productos.
                    </p>
                    <div className={styles.actions}>
                        <Link to="/" className={styles.primaryBtn}>
                            Volver al inicio
                        </Link>
                        <Link to="/products" className={styles.secondaryBtn}>
                            Ver productos
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

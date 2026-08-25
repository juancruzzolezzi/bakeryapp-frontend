import React from "react";
import styles from "./Nosotros.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";

const Nosotros = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />
            
            <div className={styles.sectionContainer}>
                <div className={styles.intro}>
                    <h1>Sobre Nosotros</h1>
                    <p>
                        Bienvenidos a nuestra bakery, donde cada día horneamos con amor y
                        dedicación para compartir dulces momentos con nuestra comunidad.
                    </p>
                </div>

                <div className={styles.cardsGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🌾</div>
                        <h3>Calidad</h3>
                        <p>
                            Ingredientes de la más alta calidad para crear productos frescos
                            y deliciosos que alegran cualquier ocasión.
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🎂</div>
                        <h3>Variedad</h3>
                        <p>
                            Desde panes artesanales hasta pasteles personalizados, cada
                            creación es una obra de arte que refleja nuestro compromiso con
                            la excelencia.
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>🌱</div>
                        <h3>Compromiso local</h3>
                        <p>
                            Apoyamos a los productores locales y usamos ingredientes
                            orgánicos siempre que es posible, innovando con nuevos sabores
                            y técnicas.
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon}>💛</div>
                        <h3>Comunidad</h3>
                        <p>
                            Agradecemos ser parte de sus celebraciones y momentos
                            especiales, y esperamos seguir endulzando sus vidas por muchos
                            años más.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nosotros;

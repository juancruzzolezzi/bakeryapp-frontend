import React from "react";
import styles from "./Nosotros.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";

const Nosotros = () => {
    return (
        <div className={styles.container}>
            <NavBarHome />
            
            <div className={styles.sectionContainer}>
                <div className={styles.textContainer}>
                    <section className={styles.section1}>
                        <h1>Sobre Nosotros</h1>
                        <p>
                            Bienvenidos a nuestra bakery, donde cada día horneamos con amor y
                            dedicación. Nuestro emprendimiento nació de la pasión por la
                            repostería y el deseo de compartir dulces momentos con nuestra
                            comunidad. Utilizamos ingredientes de la más alta calidad para crear
                            productos frescos y deliciosos que alegran cualquier ocasión.
                        </p>
                        <p>
                            Desde nuestros inicios, hemos trabajado arduamente para perfeccionar
                            nuestras recetas y ofrecer una amplia variedad de productos que
                            satisfagan todos los gustos. Desde panes artesanales hasta pasteles
                            personalizados, cada creación es una obra de arte que refleja
                            nuestro compromiso con la excelencia.
                        </p>
                        <p>
                            Creemos en la importancia de apoyar a los productores locales y
                            utilizamos ingredientes orgánicos siempre que es posible. Nuestro
                            equipo de talentosos panaderos y pasteleros se dedica a innovar y
                            experimentar con nuevos sabores y técnicas, asegurando que siempre
                            haya algo nuevo y emocionante para probar.
                        </p>
                        <p>
                            Agradecemos a nuestra comunidad por su continuo apoyo y por
                            permitirnos ser parte de sus celebraciones y momentos especiales.
                            Esperamos seguir endulzando sus vidas con nuestras deliciosas
                            creaciones por muchos años más.
                        </p>
                    </section>
                    <section className={styles.section2}>
                        <h2>Contactanos</h2>
                        <p>
                            <strong>Email:</strong> contacto@bakery.com
                        </p>
                        <p>
                            <strong>Teléfono:</strong> +123 456 7890
                        </p>
                        <p>
                            <strong>Instagram:</strong>{" "}
                            <a
                                href="https://www.instagram.com/bakery"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @bakery
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Nosotros;

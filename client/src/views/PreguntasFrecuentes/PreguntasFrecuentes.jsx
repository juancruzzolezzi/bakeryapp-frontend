import React, { useState } from "react";
import styles from "./PreguntasFrecuentes.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";

// TODO: revisar y ajustar el contenido de las preguntas cuando esté definido
const FAQS = [
    {
        pregunta: "¿Cómo puedo hacer un pedido?",
        respuesta:
            "Podés hacer tu pedido a través de nuestra página de Productos o escribiéndonos directamente por WhatsApp desde la sección Contactanos.",
    },
    {
        pregunta: "¿Con cuánta anticipación tengo que pedir?",
        respuesta:
            "Recomendamos pedir con al menos 48hs de anticipación, especialmente para tortas o pedidos personalizados.",
    },
    {
        pregunta: "¿Hacen envíos a domicilio?",
        respuesta:
            "Sí, coordinamos el envío según la zona. Consultanos por WhatsApp la disponibilidad y el costo para tu dirección.",
    },
    {
        pregunta: "¿Qué formas de pago aceptan?",
        respuesta:
            "Aceptamos efectivo y transferencia. Podés coordinar el medio de pago al confirmar tu pedido.",
    },
    {
        pregunta: "¿Puedo personalizar mi pedido?",
        respuesta:
            "¡Por supuesto! Contanos qué tenés en mente por WhatsApp y lo armamos juntos.",
    },
];

const PreguntasFrecuentes = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <div className={styles.container}>
            <NavBarHome />

            <div className={styles.sectionContainer}>
                <div className={styles.intro}>
                    <h1>Preguntas Frecuentes</h1>
                    <p>
                        Encontrá las respuestas a las dudas más comunes. Si no encontrás
                        lo que buscás, escribinos por WhatsApp y con gusto te ayudamos.
                    </p>
                </div>

                <div className={styles.faqList}>
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={faq.pregunta} className={styles.faqItem}>
                                <button
                                    type="button"
                                    className={styles.faqQuestion}
                                    onClick={() => toggle(index)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{faq.pregunta}</span>
                                    <span
                                        className={`${styles.faqIcon} ${
                                            isOpen ? styles.faqIconOpen : ""
                                        }`}
                                    >
                                        +
                                    </span>
                                </button>
                                <div
                                    className={`${styles.faqAnswer} ${
                                        isOpen ? styles.faqAnswerOpen : ""
                                    }`}
                                >
                                    <p>{faq.respuesta}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PreguntasFrecuentes;

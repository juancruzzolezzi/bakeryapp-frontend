import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import { LEGAL } from "../../constants/legal";
import { CONTACTO } from "../../constants/contacto";
import styles from "./Legal.module.css";

// Política de privacidad según la Ley 25.326 de Protección de Datos
// Personales. TODO: revisar con un abogado antes de publicar, y registrar
// la base de datos ante la AAIP (Registro Nacional de Bases de Datos).
const Privacidad = () => {
    return (
        <LegalLayout
            titulo="Política de privacidad"
            intro="En Bakery cuidamos tus datos personales. Acá te contamos qué datos juntamos, para qué los usamos y cómo podés ejercer tus derechos, de acuerdo con la Ley 25.326 de Protección de Datos Personales."
            resumen={[
                "Usamos tus datos solo para preparar, cobrar y entregar tus pedidos.",
                "No vemos ni guardamos los datos de tu tarjeta: el pago lo procesa Mercado Pago.",
                "No vendemos tus datos. Podés pedirnos verlos, corregirlos o borrarlos cuando quieras.",
            ]}
        >
            <h2>1. Responsable de los datos</h2>
            <p>
                El responsable de la base de datos es {LEGAL.razonSocial}, CUIT {LEGAL.cuit},
                con domicilio en {LEGAL.domicilio}. Podés contactarnos en{" "}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>.
            </p>

            <h2>2. Qué datos recolectamos</h2>
            <ul>
                <li>
                    <strong>Al crear una cuenta:</strong> nombre de usuario, email y
                    contraseña (que guardamos cifrada, nunca en texto plano). Si
                    ingresás con Google, recibimos tu nombre y email de tu cuenta de
                    Google.
                </li>
                <li>
                    <strong>Al hacer un pedido:</strong> tu usuario de Instagram o
                    número de WhatsApp, la dirección y el barrio de entrega (si elegís
                    delivery) y el detalle de los productos.
                </li>
                <li>
                    <strong>Al pagar:</strong> el pago lo procesa Mercado Pago. Nosotros
                    no vemos ni guardamos los datos de tu tarjeta; Mercado Pago nos
                    informa el resultado del pago y el email que usaste.
                </li>
                <li>
                    <strong>Al usar el botón de arrepentimiento:</strong> nombre, email y
                    los datos de la compra que nos indiques.
                </li>
                <li>
                    <strong>En tu dispositivo:</strong> guardamos en el almacenamiento
                    local del navegador tu carrito, tus favoritos, tu última dirección de
                    entrega y tu sesión, para que no tengas que cargarlos de nuevo. No
                    usamos cookies publicitarias.
                </li>
            </ul>

            <h2>3. Para qué los usamos</h2>
            <ul>
                <li>Preparar, cobrar y entregar tus pedidos, y contactarte por ellos.</li>
                <li>Enviarte la confirmación de compra por email.</li>
                <li>Gestionar tu cuenta y aplicar el descuento para usuarios registrados.</li>
                <li>Responder consultas, reclamos y solicitudes de arrepentimiento.</li>
            </ul>
            <p>
                No vendemos ni alquilamos tus datos, ni los usamos para fines distintos
                de los indicados sin pedirte consentimiento.
            </p>

            <h2>4. Con quién los compartimos</h2>
            <p>
                Solo con los proveedores que necesitamos para que el sitio funcione, y
                únicamente con los datos indispensables: Mercado Pago (pagos), Google
                (inicio de sesión con Google), nuestro proveedor de envío de emails y los
                servicios de alojamiento del sitio. Algunos de estos proveedores pueden
                procesar datos fuera de la Argentina, con niveles de protección
                adecuados. También podemos compartirlos si una autoridad competente lo
                requiere legalmente.
            </p>

            <h2>5. Cuánto tiempo los guardamos</h2>
            <p>
                Los datos de tu cuenta, mientras la mantengas activa. Los datos de
                pedidos y solicitudes, durante el tiempo necesario para cumplir con
                obligaciones legales, contables e impositivas.
            </p>

            <h2>6. Tus derechos</h2>
            <p>
                Podés pedirnos en cualquier momento acceder a tus datos, rectificarlos,
                actualizarlos o suprimirlos, escribiendo a{" "}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>. El derecho de
                acceso es gratuito en intervalos no menores a seis meses, salvo que
                acredites un interés legítimo (art. 14, inc. 3, Ley 25.326).
                Respondemos los pedidos de acceso dentro de los 10 días corridos y los
                de rectificación, actualización o supresión dentro de los 5 días
                hábiles.
            </p>
            <p className={styles.notice}>
                La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano
                de Control de la Ley N° 25.326, tiene la atribución de atender las
                denuncias y reclamos que interpongan quienes resulten afectados en sus
                derechos por incumplimiento de las normas vigentes en materia de
                protección de datos personales.
            </p>

            <h2>7. Seguridad</h2>
            <p>
                Usamos conexiones cifradas (HTTPS), guardamos las contraseñas cifradas y
                limitamos el acceso a los datos a lo necesario para operar. Aun así,
                ningún sistema es 100% invulnerable: si detectamos un incidente que
                afecte tus datos, te vamos a avisar.
            </p>

            <h2>8. Menores de edad</h2>
            <p>
                Para comprar en el sitio tenés que ser mayor de 18 años o contar con la
                autorización de tu madre, padre o tutor.
            </p>

            <h2>9. Cambios en esta política</h2>
            <p>
                Si modificamos esta política, vamos a publicar la nueva versión en esta
                página con su fecha de actualización. Ver también los{" "}
                <Link to="/terminos">términos y condiciones</Link>.
            </p>
        </LegalLayout>
    );
};

export default Privacidad;

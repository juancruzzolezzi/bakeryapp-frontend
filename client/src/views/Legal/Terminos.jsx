import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import { LEGAL, DEFENSA_CONSUMIDOR_URL } from "../../constants/legal";
import { CONTACTO } from "../../constants/contacto";
import {
    DELIVERY_ZONES,
    DELIVERY_FEE,
    FREE_SHIPPING_THRESHOLD,
} from "../../constants/deliveryZones";

const formatearPrecio = (monto) => `$${monto.toLocaleString("es-AR")}`;

// Términos y condiciones de la tienda online. TODO: revisar con un abogado
// antes de publicar.
const Terminos = () => {
    return (
        <LegalLayout
            titulo="Términos y condiciones"
            intro="Estos términos regulan el uso del sitio y las compras que hagas en Bakery. Al hacer un pedido, aceptás estas condiciones."
            resumen={[
                "Pagás con Mercado Pago; el pedido se confirma cuando se aprueba el pago.",
                `Delivery solo en nuestra zona, ${formatearPrecio(DELIVERY_FEE)} (gratis desde ${formatearPrecio(FREE_SHIPPING_THRESHOLD)}), o retiro sin costo en el local.`,
                "Podés arrepentirte dentro de los 10 días; mejor antes de que preparemos tu pedido.",
            ]}
        >
            <h2>1. Quiénes somos</h2>
            <p>
                El sitio es operado por {LEGAL.razonSocial}, CUIT {LEGAL.cuit}, con
                domicilio en {LEGAL.domicilio} (en adelante, "Bakery"). Contacto:{" "}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> y WhatsApp{" "}
                {CONTACTO.whatsappTexto}.
            </p>

            <h2>2. Productos y precios</h2>
            <ul>
                <li>
                    Los precios están expresados en pesos argentinos e incluyen IVA. El
                    precio que vale es el que figura al momento de confirmar el pedido.
                </li>
                <li>
                    Las fotos son ilustrativas: al ser productos artesanales, la
                    presentación puede variar levemente.
                </li>
                <li>
                    Los productos están sujetos a disponibilidad. Si algo de tu pedido
                    no está disponible, te contactamos para ofrecerte un reemplazo o
                    devolverte el importe de ese producto.
                </li>
                <li>
                    Las cuentas registradas tienen un 10% de descuento en toda la
                    tienda, que se aplica automáticamente al pagar con la sesión iniciada.
                </li>
            </ul>

            <h2>3. Pedidos y pago</h2>
            <p>
                Los pedidos se pagan online con Mercado Pago. El pedido queda confirmado
                cuando Mercado Pago aprueba el pago; en ese momento te llega un email de
                confirmación y te contactamos por Instagram o WhatsApp para coordinar la
                entrega. Para tortas y pedidos especiales recomendamos pedir con al
                menos 48 hs de anticipación.
            </p>

            <h2>4. Entregas</h2>
            <ul>
                <li>
                    <strong>Delivery:</strong> solo a los barrios de nuestra zona de
                    cobertura ({DELIVERY_ZONES.join(", ")}). El envío cuesta{" "}
                    {formatearPrecio(DELIVERY_FEE)} y es gratis en compras desde{" "}
                    {formatearPrecio(FREE_SHIPPING_THRESHOLD)} (sin contar el envío).
                </li>
                <li>
                    <strong>Take Away:</strong> retirás tu pedido sin costo en{" "}
                    {CONTACTO.direccion}, en el horario de atención ({CONTACTO.horario}).
                </li>
                <li>
                    El día y la franja horaria de entrega se coordinan con vos después
                    del pago. Si no hay nadie para recibir el pedido en el horario
                    acordado, coordinamos una nueva entrega.
                </li>
            </ul>

            <h2>5. Arrepentimiento, cambios y devoluciones</h2>
            <p>
                Podés revocar tu compra dentro de los 10 días corridos, en los términos
                del art. 34 de la Ley 24.240 y los arts. 1110 y siguientes del Código
                Civil y Comercial, usando el{" "}
                <Link to="/arrepentimiento">botón de arrepentimiento</Link>. Las
                condiciones para alimentos perecederos y productos personalizados están
                en nuestra{" "}
                <Link to="/cambios-y-devoluciones">política de cambios y devoluciones</Link>.
            </p>

            <h2>6. Alérgenos</h2>
            <p>
                Elaboramos todos los productos en la misma cocina, donde se usan harina
                de trigo, huevo, leche, frutos secos, maní y soja, por lo que pueden
                contener trazas. Si tenés alguna alergia o celiaquía, consultanos antes
                de comprar.
            </p>

            <h2>7. Cuentas</h2>
            <p>
                Sos responsable de mantener la confidencialidad de tu contraseña y de
                la actividad de tu cuenta. Podés pedir la baja de tu cuenta en cualquier
                momento escribiendo a nuestro email. El tratamiento de tus datos se rige
                por nuestra <Link to="/privacidad">política de privacidad</Link>.
            </p>

            <h2>8. Propiedad intelectual</h2>
            <p>
                La marca, los textos, las fotos y el diseño del sitio pertenecen a
                Bakery o a sus licenciantes, y no pueden usarse sin autorización.
            </p>

            <h2>9. Modificaciones</h2>
            <p>
                Podemos actualizar estos términos. Los cambios rigen desde su
                publicación en esta página y no afectan a los pedidos ya confirmados.
            </p>

            <h2>10. Ley aplicable y reclamos</h2>
            <p>
                Estos términos se rigen por las leyes de la República Argentina, en
                particular la Ley 24.240 de Defensa del Consumidor. Ante cualquier
                reclamo, escribinos primero a{" "}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>. También podés
                hacer tu reclamo en la{" "}
                <a href={DEFENSA_CONSUMIDOR_URL} target="_blank" rel="noopener noreferrer">
                    Ventanilla Única Federal de Defensa del Consumidor
                </a>
                .
            </p>
        </LegalLayout>
    );
};

export default Terminos;

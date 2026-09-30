import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import { CONTACTO } from "../../constants/contacto";

// Política de cambios y devoluciones. TODO: confirmar plazos y condiciones
// con el local y revisarla con un abogado antes de publicar.
const CambiosDevoluciones = () => {
    return (
        <LegalLayout
            titulo="Cambios y devoluciones"
            intro="Nuestros productos son alimentos frescos, hechos en el día. Por eso tenemos reglas específicas para cambios y devoluciones, siempre respetando tus derechos como consumidor."
            resumen={[
                "Podés arrepentirte de la compra dentro de los 10 días corridos.",
                "Si algo llegó mal, avisanos en 24 hs: lo reponemos o te devolvemos el dinero.",
                "No hay cambios por gusto de productos ya entregados.",
            ]}
        >
            <h2>1. Derecho de arrepentimiento</h2>
            <p>
                Como toda compra hecha a distancia, podés revocarla dentro de los{" "}
                <strong>10 días corridos</strong> desde la compra o la entrega, lo que
                ocurra último, sin costo y sin tener que dar explicaciones (art. 34 de
                la Ley 24.240 y art. 1110 del Código Civil y Comercial). Para hacerlo,
                usá el <Link to="/arrepentimiento">botón de arrepentimiento</Link>: te
                damos un código de identificación de tu solicitud y te devolvemos el
                total pagado.
            </p>
            <p>
                <strong>Importante:</strong> el art. 1116 del Código Civil y Comercial
                exceptúa del derecho de revocación a los productos que pueden
                deteriorarse con rapidez y a los confeccionados según las
                especificaciones del cliente (por ejemplo, una torta personalizada). Por
                eso, si querés arrepentirte, te recomendamos avisarnos{" "}
                <strong>antes de que preparemos o entreguemos tu pedido</strong>: en ese
                caso siempre te devolvemos el 100%.
            </p>

            <h2>2. Productos en mal estado o pedidos con errores</h2>
            <p>
                Si recibiste un producto en mal estado, dañado o distinto de lo que
                pediste, avisanos dentro de las <strong>24 hs</strong> de la entrega por
                WhatsApp ({CONTACTO.whatsappTexto}) o a{" "}
                <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a>, con una foto
                del producto y tu número de pedido. Te ofrecemos, a tu elección, la
                reposición del producto sin cargo o la devolución de su importe
                (incluido el envío, si corresponde).
            </p>

            <h2>3. Cambios por gusto</h2>
            <p>
                Por razones de higiene y seguridad alimentaria, no aceptamos cambios por
                gusto de productos ya entregados.
            </p>

            <h2>4. Cancelaciones</h2>
            <p>
                Podés cancelar tu pedido sin costo mientras no lo hayamos empezado a
                preparar. Para tortas y pedidos especiales, avisanos con al menos 24 hs
                de anticipación a la fecha de entrega acordada.
            </p>

            <h2>5. Cómo recibís el reintegro</h2>
            <p>
                Los reintegros se hacen por el mismo medio de pago que usaste, a través
                de Mercado Pago. El tiempo en que se acredita depende del medio de pago
                (en tarjetas de crédito puede verse en el próximo resumen).
            </p>
        </LegalLayout>
    );
};

export default CambiosDevoluciones;

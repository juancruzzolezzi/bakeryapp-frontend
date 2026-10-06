// Textos y pasos de un pedido, compartidos por la página de seguimiento
// (views/Pedido), "Mis pedidos" y el panel del local. Los estados son los
// del backend (api/orders/estados.js).
import { CONTACTO } from "../constants/contacto";

export const ORDEN_ESTADOS = ["recibido", "preparacion", "camino", "entregado"];

//El token del link de seguimiento: 32 caracteres hexadecimales.
export const esTokenDePedido = (token) => typeof token === "string" && /^[a-f0-9]{32}$/.test(token);

export const formatearPrecio = (monto) => `$${Number(monto || 0).toLocaleString("es-AR")}`;

export const formatearHora = (iso) =>
  //24 hs ("15:02"): en es-AR el formato por defecto es "03:02 p. m.".
  iso ? new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

//"Hoy", "Ayer" o la fecha corta ("28 sep").
export const formatearDia = (iso) => {
  if (!iso) return "";
  const fecha = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (fecha.toDateString() === hoy.toDateString()) return "Hoy";
  if (fecha.toDateString() === ayer.toDateString()) return "Ayer";
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short" }).replace(".", "");
};

export const esDelivery = (pedido) => pedido?.deliveryType === "delivery";

//Nombre corto de cada estado (chips de "Mis pedidos" y del panel).
export const etiquetaEstado = (pedido) => {
  switch (pedido?.status) {
    case "pendiente_pago":
      return "Esperando el pago";
    case "recibido":
      return "Recibido";
    case "preparacion":
      return "En preparación";
    case "camino":
      return esDelivery(pedido) ? "En camino" : "Listo para retirar";
    case "entregado":
      return esDelivery(pedido) ? "Entregado" : "Retirado";
    default:
      return "";
  }
};

//Título y bajada de la página de seguimiento, según estado y entrega.
export const encabezadoPedido = (pedido) => {
  const delivery = esDelivery(pedido);
  switch (pedido?.status) {
    case "pendiente_pago":
      return ["Esperando el pago", "Apenas Mercado Pago lo confirme, empezamos con tu pedido."];
    case "recibido":
      return ["Recibimos tu pedido", "Ya está en la cocina. Te avisamos cuando lo empecemos."];
    case "preparacion":
      return ["Lo estamos preparando", "Lo horneamos en el día. Te avisamos cuando esté listo."];
    case "camino":
      return delivery
        ? ["Tu pedido va en camino", "Sale con el repartidor. Te escribimos por WhatsApp si hace falta."]
        : ["Listo para retirar", `Te esperamos en ${CONTACTO.direccion} (${CONTACTO.horario}).`];
    case "entregado":
      return delivery
        ? ["Entregado", `Lo recibiste a las ${formatearHora(pedido.deliveredAt)}. ¡Que lo disfrutes!`]
        : ["Retirado", `Lo retiraste a las ${formatearHora(pedido.deliveredAt)}. ¡Que lo disfrutes!`];
    default:
      return ["Tu pedido", ""];
  }
};

//Los 4 pasos con su hora y si ya pasó ("hecho"), es el actual o falta.
export const pasosDelPedido = (pedido) => {
  const delivery = esDelivery(pedido);
  const indice = ORDEN_ESTADOS.indexOf(pedido?.status); //-1 si falta el pago
  const pasos = [
    { estado: "recibido", titulo: "Recibido", hora: pedido?.paidAt, detalle: `Mercado Pago aprobó el pago de ${formatearPrecio(pedido?.total)}.` },
    { estado: "preparacion", titulo: "En preparación", hora: pedido?.preparingAt, detalle: "Lo horneamos en el día." },
    delivery
      ? { estado: "camino", titulo: "En camino", hora: pedido?.shippedAt, detalle: "Sale con el repartidor." }
      : { estado: "camino", titulo: "Listo para retirar", hora: pedido?.shippedAt, detalle: `Pasá a buscarlo por ${CONTACTO.direccion}.` },
    { estado: "entregado", titulo: delivery ? "Entregado" : "Retirado", hora: pedido?.deliveredAt, detalle: "¡Que lo disfrutes!" },
  ];
  return pasos.map((paso, i) => {
    const hecho = i < indice || (i === indice && pedido.status === "entregado");
    const actual = i === indice && !hecho;
    return { ...paso, hecho, actual, hora: hecho || actual ? formatearHora(paso.hora) : "" };
  });
};

//Texto del botón del panel para pasar al estado siguiente.
export const accionSiguiente = (pedido) => {
  const delivery = esDelivery(pedido);
  switch (pedido?.status) {
    case "recibido":
      return { estado: "preparacion", texto: "Empezar a preparar" };
    case "preparacion":
      return { estado: "camino", texto: delivery ? "Salió con el repartidor" : "Listo para retirar" };
    case "camino":
      return { estado: "entregado", texto: delivery ? "Marcar entregado" : "Marcar retirado" };
    default:
      return null;
  }
};

//"2 Cookies de Chocolate, 1 Torta Red Velvet"
export const resumenItems = (pedido) =>
  (pedido?.items || []).map((item) => `${item.quantity} ${item.title}`).join(", ");

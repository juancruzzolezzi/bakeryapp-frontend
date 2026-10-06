// "¿Cuándo lo querés?" del checkout: cuanto antes, o programado para un
// día (sin franja horaria: el horario se coordina por WhatsApp). Tiene que
// coincidir con api/mercadoPago/entrega.js en el backend, que es donde se
// rechaza de verdad una fecha que no corresponde.
import { CONTACTO } from "../constants/contacto";
import { detalleHorario, estaAbiertoAhora } from "./horarioLocal";

// Lo que se hornea por encargo necesita esta anticipación, en días.
export const DIAS_ENCARGO = 2;

// Productos que se hornean por encargo (48 hs). Por nombre y no por
// categoría: en "Tortas" también hay brownies por unidad, y hay tortas en
// "Sin TACC" y "Vegano".
export const requiereEncargo = (titulo) =>
  /^(torta|cheesecake)\b/i.test(String(titulo || "").trim());

export const productosPorEncargo = (cartList) =>
  cartList.filter((product) => requiereEncargo(product.title));

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// "2026-10-08" con la fecha local (no toISOString, que pasa a UTC y de
// noche ya da el día siguiente).
const aFechaISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Próximos días en que se puede programar: desde mañana (o desde pasado
// mañana si hay algo por encargo), salteando los días que el local cierra.
export const diasParaProgramar = ({ conEncargo, ahora = new Date(), cantidad = 6 }) => {
  const abiertos = CONTACTO.horarioAtencion.dias;
  const dias = [];
  for (let i = conEncargo ? DIAS_ENCARGO : 1; dias.length < cantidad && i <= 30; i++) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
    if (!abiertos.includes(d.getDay())) continue;
    dias.push({
      fecha: aFechaISO(d),
      corto: DIAS_CORTOS[d.getDay()],
      numero: d.getDate(),
      largo: d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }).replace(",", ""),
    });
  }
  return dias;
};

// Bajada de "Cuanto antes": con el local cerrado, avisa cuándo se prepara
// en vez de prometer "hoy".
export const textoCuantoAntes = (ahora = new Date()) =>
  estaAbiertoAhora(CONTACTO.horarioAtencion, ahora)
    ? "Lo preparamos hoy y te escribimos cuando sale"
    : `Ahora estamos cerrados: lo preparamos apenas abramos (${detalleHorario(CONTACTO.horarioAtencion, ahora)})`;

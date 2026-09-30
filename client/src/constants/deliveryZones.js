// Barrios donde hacemos delivery. Tiene que coincidir con DELIVERY_ZONES en
// el backend (api/mercadoPago/config.js): acá se usa para el selector del
// modal de pago y para avisar ANTES de pagar si la dirección queda fuera
// de cobertura; el backend es el que rechaza de verdad un pedido fuera de zona.
// TODO: ajustar a la cobertura real del local.
export const DELIVERY_ZONES = [
    "Belgrano",
    "Colegiales",
    "Coghlan",
    "Núñez",
    "Palermo",
    "Saavedra",
    "Villa Ortúzar",
    "Villa Urquiza",
];

// Costo fijo de envío a domicilio. Tiene que coincidir con DELIVERY_FEE en
// api/mercadoPago/src/controllers/payment.controller.js (ahí es donde se
// cobra de verdad; acá solo se usa para mostrarle el total al usuario antes de pagar).
export const DELIVERY_FEE = 2000;

// A partir de este monto (sin contar el envío) el delivery sale gratis.
// Tiene que coincidir con FREE_SHIPPING_THRESHOLD en payment.controller.js
// (ahí es donde se cobra de verdad).
// TODO: ajustar al monto mínimo real que definan para envío gratis.
export const FREE_SHIPPING_THRESHOLD = 15000;

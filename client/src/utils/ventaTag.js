// La base no tiene un campo dedicado para esto: se marca escribiendo
// "(por porción)", "(por unidad)", "(por docena)" o "(por media docena)"
// al final de la descripción (ver api/db/bakery.db), y acá se lee para
// mostrarlo como chip en la foto en vez de dejarlo perdido en el texto.
const VENTA_TAG_REGEX = /\s*\(por (porción|unidad|media docena|docena)\)/i;

const ETIQUETAS = {
    "porción": "Por porción",
    "unidad": "Por unidad",
    "docena": "Por docena",
    "media docena": "Por media docena",
};

// Devuelve la etiqueta a mostrar (o null si la descripción no la tiene) y
// la descripción sin ese paréntesis, para no repetirlo dos veces.
export const getVentaInfo = (description) => {
    const match = description?.match(VENTA_TAG_REGEX);
    return {
        tag: match ? ETIQUETAS[match[1].toLowerCase()] : null,
        descripcionLimpia: description?.replace(VENTA_TAG_REGEX, "").trim(),
    };
};

// Modo demo: el sitio es un proyecto académico (Bakery es una marca
// ficticia) que se publicita con una campaña real de Google Ads. Mientras
// esté en true:
// - se muestra el aviso de arriba de todo (components/DemoBanner),
// - "Pagar" NO llama a Mercado Pago: muestra un aviso (ver views/Pagar),
// - las páginas legales aclaran que no hay una empresa real detrás.
export const MODO_DEMO = true;

// ID de medición de Google Analytics 4 ("G-XXXXXXXXXX"). Vacío = no se
// carga Analytics (ver utils/analytics.js).
export const GA_MEASUREMENT_ID = "G-Q73T2JQ4PD";

// ID de la etiqueta de Google Ads ("AW-XXXXXXXXXX"). Vacío = no se carga.
export const GOOGLE_ADS_ID = "";

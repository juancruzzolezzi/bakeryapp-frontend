import { GA_MEASUREMENT_ID } from "../constants/demo";

let iniciado = false;

// Carga Google Analytics 4 (gtag.js) una sola vez. Las páginas vistas las
// registra GA solo: la "medición mejorada" (activada por defecto en GA4)
// detecta los cambios de ruta de React Router, así que no se mandan a
// mano. En localhost no se carga, para no ensuciar los datos de la campaña.
export const initAnalytics = () => {
  if (iniciado || !GA_MEASUREMENT_ID || window.location.hostname === "localhost") return;
  iniciado = true;

  window.dataLayer = window.dataLayer || [];
  //gtag necesita el objeto "arguments" tal cual, no un array.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

// Evento de GA4 (ej: "add_to_cart"). Si Analytics no está cargado, no hace nada.
export const trackEvent = (nombre, params = {}) => {
  if (typeof window.gtag === "function") window.gtag("event", nombre, params);
};

// Formato de producto que esperan los eventos de e-commerce de GA4.
export const itemGA = (product, quantity = 1) => ({
  item_id: String(product.id),
  item_name: product.title,
  price: product.price,
  quantity,
});

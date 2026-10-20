import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "../constants/demo";

let iniciado = false;

// Carga gtag.js una sola vez, con Google Analytics 4 y/o la etiqueta de
// Google Ads (los IDs que estén cargados en constants/demo.js). Las páginas
// vistas las registra GA solo: la "medición mejorada" (activada por defecto
// en GA4) detecta los cambios de ruta de React Router, así que no se mandan
// a mano. En localhost no se carga, para no ensuciar los datos de la campaña.
export const initAnalytics = () => {
  const ids = [GA_MEASUREMENT_ID, GOOGLE_ADS_ID].filter(Boolean);
  if (iniciado || ids.length === 0 || window.location.hostname === "localhost") return;
  iniciado = true;

  window.dataLayer = window.dataLayer || [];
  //gtag necesita el objeto "arguments" tal cual, no un array.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  ids.forEach((id) => window.gtag("config", id));

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ids[0]}`;
  document.head.appendChild(script);

  //Clics en cualquier link a WhatsApp o Instagram del sitio (footer,
  //contacto, FAQ, home...), sin tener que acordarse de cada botón. Los que
  //abren WhatsApp con window.open (carrito, eventos) llaman a
  //trackContacto a mano.
  document.addEventListener(
    "click",
    (e) => {
      const href = e.target.closest?.("a[href]")?.getAttribute("href") || "";
      if (href.includes("wa.me/")) trackContacto("whatsapp", "link");
      else if (href.includes("instagram.com")) trackContacto("instagram", "link");
    },
    true
  );
};

// Evento de GA4 (ej: "add_to_cart"). Si Analytics no está cargado, no hace nada.
export const trackEvent = (nombre, params = {}) => {
  if (typeof window.gtag === "function") window.gtag("event", nombre, params);
};

// Clic para contactar por WhatsApp o Instagram: "click_whatsapp" o
// "click_instagram", con la página desde la que se hizo y de qué botón vino.
export const trackContacto = (red, origen) => {
  trackEvent(`click_${red}`, { pagina: window.location.pathname, origen });
};

// Formato de producto que esperan los eventos de e-commerce de GA4.
export const itemGA = (product, quantity = 1) => ({
  item_id: String(product.id),
  item_name: product.title,
  price: product.price,
  quantity,
});

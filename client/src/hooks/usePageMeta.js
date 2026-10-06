import { useEffect } from "react";

// Título y descripción por página. Antes todas tenían los mismos (los de
// public/index.html), así que en Google una pestaña de Productos o de un
// producto se veía igual que la portada.
const DEFAULT_TITLE = "Bakery | Pastelería artesanal en Belgrano";
const DEFAULT_DESCRIPTION =
  "Pastelería artesanal horneada en el día y café de especialidad en Belgrano. Pedí online con delivery o take away.";

export const PAGE_META = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  "/products": {
    title: "Productos | Bakery",
    description: "Facturas, tortas, cookies, alfajores y opciones sin TACC y veganas. Pedí online con delivery o take away.",
  },
  "/nosotros": {
    title: "Nosotros | Bakery",
    description: "Quiénes somos y cómo horneamos todos los días en Belgrano.",
  },
  "/contactanos": {
    title: "Contacto | Bakery",
    description: "Escribinos por WhatsApp, Instagram o mail. Dirección y horarios del local.",
  },
  "/preguntas-frecuentes": {
    title: "Preguntas frecuentes | Bakery",
    description: "Pedidos, envíos, pagos y cambios: todo lo que suelen preguntarnos.",
  },
  "/privacidad": { title: "Política de privacidad | Bakery" },
  "/terminos": { title: "Términos y condiciones | Bakery" },
  "/cambios-y-devoluciones": { title: "Cambios y devoluciones | Bakery" },
  "/arrepentimiento": {
    title: "Botón de arrepentimiento | Bakery",
    description: "Pedí la revocación de una compra online y recibí tu código de solicitud.",
  },
  "/pagar": { title: "Finalizá tu pedido | Bakery" },
};

export const NOT_FOUND_META = { title: "Página no encontrada | Bakery" };

const setDescription = (description) => {
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", description || DEFAULT_DESCRIPTION);
};

// Pone el título y la descripción mientras "title" tenga valor (ej: en el
// detalle de producto, recién cuando cargó el producto).
export const usePageMeta = (title, description) => {
  useEffect(() => {
    if (!title) return;
    document.title = title;
    setDescription(description);
  }, [title, description]);
};

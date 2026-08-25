//Anima una miniatura viajando desde "sourceEl" (la foto del producto)
//hasta el ícono del carrito, al agregar un producto. Es puramente visual
//(no toca el estado real del carrito, eso lo hace el caller); si no
//encuentra el ícono del carrito en el DOM, no hace nada.
export const flyToCart = (sourceEl, imageUrl) => {
  const cartEl = document.querySelector("[data-cart-toggle]");
  if (!sourceEl || !cartEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const cartRect = cartEl.getBoundingClientRect();

  const chip = document.createElement("div");
  chip.style.position = "fixed";
  chip.style.left = `${srcRect.left + srcRect.width / 2 - 22}px`;
  chip.style.top = `${srcRect.top + srcRect.height / 2 - 22}px`;
  chip.style.width = "44px";
  chip.style.height = "44px";
  chip.style.borderRadius = "10px";
  chip.style.backgroundImage = imageUrl ? `url(${imageUrl})` : "none";
  chip.style.backgroundColor = "#2f2318";
  chip.style.backgroundSize = "cover";
  chip.style.backgroundPosition = "center";
  chip.style.border = "1px solid rgba(230, 201, 138, 0.4)";
  chip.style.zIndex = "9999";
  chip.style.pointerEvents = "none";
  document.body.appendChild(chip);

  const dx = cartRect.left + cartRect.width / 2 - (srcRect.left + srcRect.width / 2);
  const dy = cartRect.top + cartRect.height / 2 - (srcRect.top + srcRect.height / 2);

  const animation = chip.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(0.7)`,
        opacity: 1,
        offset: 0.6,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.3 },
    ],
    { duration: 600, easing: "cubic-bezier(.4,.2,.2,1)" }
  );

  animation.onfinish = () => {
    chip.remove();
    cartEl.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "ease" }
    );
  };
};

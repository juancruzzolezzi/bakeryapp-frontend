//Ráfaga de confetti dorado, pensada para el cartel de "compra exitosa"
//(ver Home.jsx). Crea unas piezas fijas sobre "targetEl" que caen y
//desaparecen; no depende de ninguna librería externa.
export const playConfetti = (targetEl) => {
  if (!targetEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = targetEl.getBoundingClientRect();
  const colors = ["#e7c98a", "#c9a15f", "#b69443", "#f6ecdb"];

  for (let i = 0; i < 26; i++) {
    const piece = document.createElement("div");
    const startX = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.7;

    piece.style.position = "fixed";
    piece.style.left = `${startX}px`;
    piece.style.top = `${rect.top + 6}px`;
    piece.style.width = "8px";
    piece.style.height = "8px";
    piece.style.borderRadius = "1px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.zIndex = "9999";
    piece.style.pointerEvents = "none";
    document.body.appendChild(piece);

    const rotateStart = Math.random() * 360;
    const fallX = (Math.random() - 0.5) * 160;
    const fallY = 140 + Math.random() * 90;

    piece
      .animate(
        [
          { transform: `rotate(${rotateStart}deg) translate(0,0)`, opacity: 1 },
          {
            transform: `rotate(${rotateStart + 720}deg) translate(${fallX}px, ${fallY}px)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.25,.46,.45,.94)" }
      )
      .addEventListener("finish", () => piece.remove());
  }
};

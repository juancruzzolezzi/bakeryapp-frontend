import React, { useEffect, useId, useRef, useState } from "react";
import style from "./FlautaGame.module.css";

//"Jueguito con la flauta": cada toque hace saltar la flauta de pan, que
//gira según dónde le pegues. Si toca la mesada se corta la racha. Se usa
//en el Home (sección propia) y en la página 404.
//
//La física corre en un requestAnimationFrame propio y escribe los
//transforms directo en el DOM (refs), sin pasar por el estado de React:
//re-renderizar 60 veces por segundo sería puro desperdicio. Solo los
//contadores (que cambian con cada toque, no con cada frame) usan estado.

const BEST_KEY = "flautaRecord";

//Carteles al llegar a ciertas rachas.
const HITOS = { 5: "¡Bien ahí!", 10: "¡Crack!", 20: "¡Imparable!", 35: "¡Nivel panadero!" };

const rand = (a, b) => a + Math.random() * (b - a);

const leerRecord = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const guardarRecord = (valor) => {
  try {
    localStorage.setItem(BEST_KEY, String(valor));
  } catch {
    //Sin almacenamiento (modo privado, etc.): el récord dura lo que la visita.
  }
};

//Resorte amortiguado (para el aplastado al saltar/caer y para que se
//acomode acostada al quedar quieta).
const stepSpring = (s, target, k, c, f) => {
  const a = -k * (s.x - target) - c * s.v;
  s.v += a * f;
  s.x += s.v * f;
};

//Cuánto ocupa la flauta hacia los costados (ex) y hacia arriba/abajo (ey)
//según cuánto esté girada: acostada, ey es la mitad de su alto; parada de
//punta, la mitad de su largo. Sin esto, al caer de punta se hundía en la
//mesada porque el choque se calculaba como si estuviera siempre acostada.
const extents = (p) => {
  const a = (p.rot.x * Math.PI) / 180;
  const sin = Math.abs(Math.sin(a));
  const cos = Math.abs(Math.cos(a));
  return { ex: (cos * p.w + sin * p.h) / 2, ey: (sin * p.w + cos * p.h) / 2 };
};

const FlautaGame = ({ className = "" }) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const breadRef = useRef(null);
  const innerRef = useRef(null);
  const shadowRef = useRef(null);
  const physics = useRef(null);
  const particles = useRef([]);

  const [toques, setToques] = useState(0);
  const [record, setRecord] = useState(leerRecord);
  const [usado, setUsado] = useState(false);

  //useId devuelve algo como ":r3:": los ":" rompen el url(#...) del degradé.
  const gradId = `flauta${useId().replace(/:/g, "")}`;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const popup = (x, y, text) => {
    const stage = stageRef.current;
    if (!stage) return;
    const el = document.createElement("span");
    el.className = style.pop;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    stage.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  };

  const burst = (x, y, { n = 12, speed = 3.5, grav = 0.06, up = 0.4, colors }) => {
    const total = reduce ? Math.ceil(n / 3) : n;
    for (let i = 0; i < total; i++) {
      const ang = rand(0, Math.PI * 2);
      const s = rand(0.3, 1) * speed;
      const life = Math.round(rand(0.6, 1) * 55);
      particles.current.push({
        x,
        y,
        vx: Math.cos(ang) * s,
        vy: Math.sin(ang) * s - speed * up,
        g: grav,
        r: rand(1.5, 4),
        life,
        max: life,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  //Medidas del escenario y la flauta (al montar y en cada resize).
  const layout = () => {
    const stage = stageRef.current;
    const bread = breadRef.current;
    const p = physics.current;
    if (!stage || !bread || !p) return;
    p.W = stage.clientWidth;
    p.H = stage.clientHeight;
    p.w = bread.offsetWidth;
    p.h = bread.offsetHeight;
    //Altura de la mesada (el "::after" de .stage mide 18px).
    p.ground = p.H - 18;
    p.g = 0.5 * Math.max(0.75, p.H / 460);
    if (!p.placed) {
      p.x = p.W / 2;
      p.y = p.ground - p.h / 2;
      p.placed = true;
    }
    const { ex, ey } = extents(p);
    p.x = Math.min(Math.max(p.x, ex), p.W - ex);
    p.y = Math.min(p.y, p.ground - ey);

    const canvas = canvasRef.current;
    const d = window.devicePixelRatio || 1;
    canvas.width = p.W * d;
    canvas.height = p.H * d;
    canvas.getContext("2d").setTransform(d, 0, 0, d, 0, 0);
  };

  const kick = (clientX, clientY) => {
    const stage = stageRef.current;
    const p = physics.current;
    if (!stage || !p) return;
    const r = stage.getBoundingClientRect();
    const lx = clientX - r.left;
    const ly = clientY - r.top;
    const dx = lx - p.x;
    const dy = ly - p.y;
    //Zona de toque un poco más generosa que el dibujo, girada junto con la
    //flauta (si no, parada de punta no se la podía tocar en los extremos).
    const a = (p.rot.x * Math.PI) / 180;
    const along = dx * Math.cos(a) + dy * Math.sin(a);
    const across = -dx * Math.sin(a) + dy * Math.cos(a);
    if ((along / (p.w * 0.6)) ** 2 + (across / (p.h * 1.2)) ** 2 > 1) return;

    const strength = Math.max(0.85, Math.sqrt(p.H / 460));
    p.vy = -rand(13, 15) * strength;
    p.vx = -(dx / (p.w / 2)) * 4 + rand(-1, 1);
    p.vrot += -dx * 0.16 + rand(-3, 3);
    p.resting = false;
    p.sq.v -= 0.12;
    p.streak += 1;

    const racha = p.streak;
    setToques(racha);
    setUsado(true);
    setRecord((prev) => {
      if (racha <= prev) return prev;
      guardarRecord(racha);
      return racha;
    });

    burst(lx, ly, { colors: ["#f6dcab", "#fffaf1"] });
    if (HITOS[racha]) popup(p.x, p.y - extents(p).ey - 30, HITOS[racha]);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
    kick(e.clientX, e.clientY);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    //Con teclado: un toque apenas corrido del centro, para que gire un poco.
    const r = breadRef.current.getBoundingClientRect();
    kick(r.left + r.width * rand(0.4, 0.6), r.top + r.height / 2);
  };

  const reiniciar = () => {
    const p = physics.current;
    Object.assign(p, { vx: 0, vy: 0, vrot: 0, streak: 0, resting: true, placed: false });
    p.rot.x = 0;
    p.rot.v = 0;
    layout();
    setToques(0);
    setUsado(false);
  };

  useEffect(() => {
    physics.current = {
      x: 0, y: 0, vx: 0, vy: 0, vrot: 0,
      rot: { x: 0, v: 0 },
      sq: { x: 1, v: 0 },
      resting: true, streak: 0, placed: false,
    };
    layout();

    const stage = stageRef.current;
    const ro = new ResizeObserver(layout);
    ro.observe(stage);

    const update = (f) => {
      const p = physics.current;
      if (!p.resting) {
        p.vy += p.g * f;
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.rot.x += p.vrot * f;
        p.vrot *= Math.pow(0.992, f);
        const { ex, ey } = extents(p);
        if (p.x < ex) { p.x = ex; p.vx = Math.abs(p.vx) * 0.7; p.vrot *= -0.6; }
        if (p.x > p.W - ex) { p.x = p.W - ex; p.vx = -Math.abs(p.vx) * 0.7; p.vrot *= -0.6; }
        if (p.y < ey) { p.y = ey; p.vy = Math.abs(p.vy) * 0.4; }
        //Solo cuenta como "se cayó" si toca la mesada BAJANDO: justo
        //después de un toque (subiendo) puede rozarla por estar girando, y
        //eso no debe cortar la racha.
        if (p.y + ey >= p.ground && p.vy >= 0) {
          p.y = p.ground - ey;
          if (p.streak > 0) {
            popup(p.x, p.ground - ey - 30, p.streak === 1 ? "¡Se cayó!" : `¡Se cayó! ${p.streak} toques`);
            p.streak = 0;
            setToques(0);
          }
          if (p.vy > 2.5) {
            p.sq.v -= Math.min(0.25, p.vy * 0.018);
            if (p.vy > 6) {
              burst(p.x, p.ground, { n: 8, speed: 2, grav: 0.1, up: 0.8, colors: ["#c9a36b", "#8a6a44"] });
            }
            p.vy = -p.vy * 0.4;
            p.vx *= 0.75;
            p.vrot *= 0.5;
          } else {
            p.vy = 0;
            p.resting = true;
          }
        } else if (p.y + ey > p.ground) {
          //Subiendo pero girada contra la mesada: solo se la despega.
          p.y = p.ground - ey;
        }
      } else {
        //Apoyada: frena y se acomoda acostada (múltiplo de 180°).
        p.vx *= Math.pow(0.85, f);
        p.x = Math.min(Math.max(p.x + p.vx * f, p.w / 2), p.W - p.w / 2);
        p.rot.v += p.vrot * 0.3;
        p.vrot = 0;
        stepSpring(p.rot, Math.round(p.rot.x / 180) * 180, 0.08, 0.2, f);
        //Mientras se acuesta, sigue apoyada sobre la mesada.
        const { ex, ey } = extents(p);
        p.y = p.ground - ey;
        p.x = Math.min(Math.max(p.x, ex), p.W - ex);
      }
      stepSpring(p.sq, 1, 0.18, 0.16, f);

      //El aplastado va en ejes de la pantalla ("scale" antes de "rotate"),
      //no del pan: así siempre se aplasta contra la mesada aunque caiga de
      //punta. Y se corre hacia arriba lo que se estira, para que la base
      //no atraviese la mesada.
      const { ey: eyVisual } = extents(p);
      const despegue = eyVisual * (p.sq.x - 1);
      breadRef.current.style.transform = `translate(${p.x - p.w / 2}px, ${p.y - p.h / 2 - despegue}px)`;
      innerRef.current.style.transform = `scale(${2 - p.sq.x}, ${p.sq.x}) rotate(${p.rot.x}deg)`;
      const shadow = shadowRef.current;
      const altura = Math.max(0, p.ground - (p.y + extents(p).ey));
      const k = Math.max(0.35, 1 - altura / 320);
      shadow.style.transform = `translateX(${p.x - shadow.offsetWidth / 2}px) scale(${k})`;
      shadow.style.opacity = String(k);

      //Partículas (harina al pegarle, polvito al caer).
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particles.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const q = list[i];
        q.vx *= 0.97;
        q.vy = q.vy * 0.97 + q.g * f;
        q.x += q.vx * f;
        q.y += q.vy * f;
        q.life -= f;
        if (q.life <= 0) {
          list.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, q.life / q.max);
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    //El loop solo corre mientras el juego está en pantalla: en el Home
    //está a mitad de página y no tiene sentido animar algo que no se ve.
    let raf = null;
    let last = 0;
    const loop = (now) => {
      const f = Math.min(2.5, (now - last) / 16.67);
      last = now;
      update(f);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && raf === null) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
    io.observe(stage);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
    // layout/update solo leen refs: alcanza con armar todo una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`${style.stage} ${className}`}
      ref={stageRef}
      onPointerDown={handlePointerDown}
    >
      <canvas className={style.fx} ref={canvasRef} aria-hidden="true" />

      <div className={style.hud}>
        <span className={style.chip}>
          Toques <b>{toques}</b>
        </span>
        <span className={style.chip}>
          Récord <b>{record}</b>
        </span>
      </div>

      <p className={`${style.hint} ${usado ? style.hintUsed : ""}`} aria-hidden="true">
        Tocá la flauta para que salte
      </p>

      <button type="button" className={style.reset} onClick={reiniciar}>
        Reiniciar
      </button>

      <div className={style.shadow} ref={shadowRef} />

      <div
        className={style.bread}
        ref={breadRef}
        role="button"
        tabIndex={0}
        aria-label="Flauta de pan. Presioná para hacerla saltar."
        onKeyDown={handleKeyDown}
      >
        <div ref={innerRef}>
          {/* viewBox recortado al contorno del pan (y de 24 a 112): sin márgenes
              vacíos, el choque con la mesada coincide con lo que se ve. */}
          <svg viewBox="0 24 360 88" aria-hidden="true">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f0bd72" />
                <stop offset=".55" stopColor="#c77b33" />
                <stop offset="1" stopColor="#7c3f16" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${gradId})`}
              d="M18 70 C 18 38, 62 26, 180 26 C 298 26, 342 38, 342 70 C 342 100, 298 110, 180 110 C 62 110, 18 100, 18 70 Z"
            />
            <path
              fill="#5f2e0f"
              opacity=".35"
              d="M22 80 C 70 104, 290 104, 338 80 C 334 100, 296 110, 180 110 C 64 110, 26 100, 22 80 Z"
            />
            <g fill="none" strokeLinecap="round">
              <path
                stroke="#6e3714"
                strokeWidth="11"
                opacity=".35"
                d="M62 62 L 104 44 M122 62 L 164 44 M182 62 L 224 44 M242 62 L 284 44"
              />
              <path
                stroke="#f6dcab"
                strokeWidth="6"
                d="M62 58 L 104 40 M122 58 L 164 40 M182 58 L 224 40 M242 58 L 284 40"
              />
            </g>
            <ellipse cx="160" cy="38" rx="110" ry="7" fill="#fff" opacity=".14" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FlautaGame;

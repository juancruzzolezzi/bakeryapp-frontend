import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import style from "./Filtros.module.css";

const CATEGORIAS = ["Todo", "Favoritos", "Facturas", "Tortas", "Cookies", "Alfajores", "Sin TACC", "Vegano", "Infusiones"];

const Filtros = ({ filtroActivo, setFiltroActivo, favoritosCount = 0 }) => {
  // ---- Detecta si los chips entran en un solo renglón ----
  // Se mide una copia invisible de la fila de chips (mismo ancho que la
  // visible, pero sin ocupar espacio ni verse): si algún chip queda más
  // abajo que el primero, es que hizo wrap, y se usa el desplegable en su
  // lugar. Así no depende de un ancho de pantalla fijo, sino de si
  // realmente entran (varía con la cantidad de categorías, el idioma, el
  // zoom del navegador, etc.).
  const [entraEnUnRenglon, setEntraEnUnRenglon] = useState(true);
  const medicionRef = useRef(null);

  const medirWrap = () => {
    const contenedor = medicionRef.current;
    if (!contenedor) return;
    const chips = Array.from(contenedor.children);
    if (!chips.length) return;
    const primerTop = chips[0].offsetTop;
    const wrapea = chips.some((chip) => chip.offsetTop !== primerTop);
    setEntraEnUnRenglon(!wrapea);
  };

  useEffect(() => {
    medirWrap();
    const observer = new ResizeObserver(medirWrap);
    if (medicionRef.current) observer.observe(medicionRef.current);
    window.addEventListener("resize", medirWrap);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", medirWrap);
    };
  }, []);

  // ---- Chips (cuando entran en un renglón): rayita deslizante ----
  const obtenerClaseFiltro = (filtro) => {
    return filtro === filtroActivo
      ? `${style.filtrosBtn} ${style.activo}`
      : style.filtrosBtn;
  };

  const btnRefs = useRef({});
  const indicatorRef = useRef(null);

  const moverIndicador = () => {
    const btn = btnRefs.current[filtroActivo];
    if (!btn || !indicatorRef.current) return;
    indicatorRef.current.style.left = `${btn.offsetLeft}px`;
    indicatorRef.current.style.top = `${btn.offsetTop + btn.offsetHeight}px`;
    indicatorRef.current.style.width = `${btn.offsetWidth}px`;
  };

  useLayoutEffect(moverIndicador, [filtroActivo, entraEnUnRenglon]);

  // ---- Desplegable (cuando NO entran en un renglón) ----
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [isOpen]);

  const elegirFiltro = (filtro) => {
    setFiltroActivo(filtro);
    setIsOpen(false);
  };

  const renderBadge = (filtro) =>
    filtro === "Favoritos" &&
    favoritosCount > 0 && <span className={style.filtrosBadge}>{favoritosCount}</span>;

  return (
    <div className={style.filtros}>
      {/* Copia invisible, siempre montada, solo para medir si entra en un
          renglón (ver medirWrap arriba). No ocupa espacio ni se ve. */}
      <div className={style.medicion} aria-hidden="true">
        <div className={style.filtrosGrupo} ref={medicionRef}>
          {CATEGORIAS.map((filtro) => (
            <span key={filtro} className={style.filtrosBtn}>
              {filtro}
            </span>
          ))}
        </div>
      </div>

      {entraEnUnRenglon ? (
        <div className={style.filtrosGrupo}>
          {CATEGORIAS.map((filtro) => (
            <span
              key={filtro}
              ref={(el) => (btnRefs.current[filtro] = el)}
              className={obtenerClaseFiltro(filtro)}
              onClick={() => setFiltroActivo(filtro)}
            >
              {filtro}
              {renderBadge(filtro)}
            </span>
          ))}
          <span className={style.filtrosIndicador} ref={indicatorRef} />
        </div>
      ) : (
        <div className={style.dropdown} ref={dropdownRef}>
          <button
            type="button"
            className={style.trigger}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span>
              {filtroActivo}
              {renderBadge(filtroActivo)}
            </span>
            <span className={`${style.chevron} ${isOpen ? style.chevronOpen : ""}`}>
              ▾
            </span>
          </button>

          <ul
            className={`${style.list} ${isOpen ? style.listOpen : ""}`}
            role="listbox"
          >
            {CATEGORIAS.map((filtro) => (
              <li
                key={filtro}
                role="option"
                aria-selected={filtro === filtroActivo}
                className={`${style.item} ${
                  filtro === filtroActivo ? style.itemActivo : ""
                }`}
                onClick={() => elegirFiltro(filtro)}
              >
                {filtro}
                {renderBadge(filtro)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Filtros;

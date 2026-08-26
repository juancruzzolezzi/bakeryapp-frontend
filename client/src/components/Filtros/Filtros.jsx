import React, { useEffect, useLayoutEffect, useRef } from "react";
import style from "./Filtros.module.css";

const CATEGORIAS = ["Todo", "Favoritos", "Facturas", "Tortas", "Cookies", "Alfajores", "Sin TACC", "Vegano", "Infusiones"];

const Filtros = ({ filtroActivo, setFiltroActivo }) => {
  // Paso 1: Aplicar clase activa al filtro seleccionado (el estado en sí
  // vive en Products.jsx, así se mantiene sincronizado con localStorage)
  const obtenerClaseFiltro = (filtro) => {
    return filtro === filtroActivo
      ? `${style.filtrosBtn} ${style.activo}`
      : style.filtrosBtn;
  };

  //Rayita dorada compartida (en vez de una por botón): se desliza hasta
  //la posición del filtro activo, calculada a partir de su propio botón,
  //en vez de aparecer/desaparecer de golpe en cada uno.
  const btnRefs = useRef({});
  const indicatorRef = useRef(null);

  const moverIndicador = () => {
    const btn = btnRefs.current[filtroActivo];
    if (!btn || !indicatorRef.current) return;
    indicatorRef.current.style.left = `${btn.offsetLeft}px`;
    indicatorRef.current.style.top = `${btn.offsetTop + btn.offsetHeight}px`;
    indicatorRef.current.style.width = `${btn.offsetWidth}px`;
  };

  //useLayoutEffect (no useEffect): mide el DOM después de pintar pero
  //antes de que el usuario vea el frame, para que la rayita nunca
  //parpadee en la posición vieja al cambiar de filtro.
  useLayoutEffect(moverIndicador, [filtroActivo]);

  useEffect(() => {
    window.addEventListener("resize", moverIndicador);
    return () => window.removeEventListener("resize", moverIndicador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.filtros}>
      <div className={style.filtrosGrupo}>
        {CATEGORIAS.map((filtro) => (
          <span
            key={filtro}
            ref={(el) => (btnRefs.current[filtro] = el)}
            className={obtenerClaseFiltro(filtro)}
            onClick={() => setFiltroActivo(filtro)}
          >
            {filtro}
          </span>
        ))}
        <span className={style.filtrosIndicador} ref={indicatorRef} />
      </div>
    </div>
  );
};

export default Filtros;

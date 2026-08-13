import React from "react";
import style from "./Filtros.module.css";

const Filtros = ({ filtroActivo, setFiltroActivo }) => {
  // Paso 1: Aplicar clase activa al filtro seleccionado (el estado en sí
  // vive en Products.jsx, así se mantiene sincronizado con localStorage)
  const obtenerClaseFiltro = (filtro) => {
    return filtro === filtroActivo
      ? `${style.filtrosBtn} ${style.activo}`
      : style.filtrosBtn;
  };

  return (
    <div className={style.filtros}>
      {["Todo", "Facturas", "Tortas", "Cookies", "Alfajor", "Sin TACC", "Vegano"].map((filtro) => (
        <span
          key={filtro}
          className={obtenerClaseFiltro(filtro)}
          onClick={() => setFiltroActivo(filtro)}
        >
          {filtro}
        </span>
      ))}
    </div>
  );
};

export default Filtros;

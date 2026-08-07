import React, { useState } from "react";
import style from "./Filtros.module.css";

const Filtros = ({ setFiltroActivo }) => {
  // Paso 1: Definir el estado para el filtro activo
  const [filtroActivoLocal, setFiltroActivoLocal] = useState("Todo");

  // Paso 2: Manejar el cambio de filtro
  const cambiarFiltro = (filtro) => {
    setFiltroActivoLocal(filtro);
    setFiltroActivo(filtro);
  };

  // Paso 3: Aplicar clase activa al filtro seleccionado
  const obtenerClaseFiltro = (filtro) => {
    return filtro === filtroActivoLocal
      ? `${style.filtrosBtn} ${style.activo}`
      : style.filtrosBtn;
  };

  return (
    <div className={style.filtros}>
      {["Todo", "Facturas", "Tortas", "Cookies", "Trufas"].map((filtro) => (
        <span
          key={filtro}
          className={obtenerClaseFiltro(filtro)}
          onClick={() => cambiarFiltro(filtro)}
        >
          {filtro}
        </span>
      ))}
    </div>
  );
};

export default Filtros;

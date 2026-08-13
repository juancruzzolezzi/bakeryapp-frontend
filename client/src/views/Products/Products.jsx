import React, { useState, useEffect } from "react";
import Product from "../../components/Product/Product";
import Filtros from "../../components/Filtros/Filtros";
import NavBar from "../../components/Navs/NavBar/NavBar";
import { useGetProductsQuery } from "../../api/appApi";
import style from "./Products.module.css";

//Variable de módulo (no useState): sobrevive mientras dure la sesión del
//navegador (navegar a Home y volver a Cocina con el router de React NO la
//reinicia), pero SÍ se reinicia a false en un refresh real de la página
//(F5), porque ahí se vuelve a cargar todo el JS desde cero. Así se puede
//distinguir "volviste navegando" (debe resetear a Todo) de "refrescaste
//la página" (debe mantener el filtro guardado en localStorage).
let yaSeMontoProductsEnEstaSesion = false;

const Products = () => {
  const { data } = useGetProductsQuery();
  const products = data;

  //Se guarda el filtro elegido en localStorage para que, si se refresca la
  //página, se mantenga seleccionado en vez de volver a "Todo". Pero si se
  //vuelve navegando (Home -> Cocina) en la misma sesión, se resetea a "Todo".
  //
  //El inicializador de useState tiene que ser una función PURA (sin efectos
  //secundarios): en desarrollo, React la llama dos veces para detectar
  //justamente este tipo de bug, así que escribir en localStorage acá adentro
  //hacía que la segunda llamada pisara el valor de la primera. Por eso solo
  //lee acá, y la escritura/actualización del flag se hace en el useEffect
  //de abajo (que si se ejecuta de más, no rompe nada por ser idempotente).
  const [filtroActivo, setFiltroActivoState] = useState(() =>
    yaSeMontoProductsEnEstaSesion
      ? "Todo"
      : localStorage.getItem("filtroActivo") || "Todo"
  );

  useEffect(() => {
    if (yaSeMontoProductsEnEstaSesion) {
      localStorage.setItem("filtroActivo", "Todo");
    }
    yaSeMontoProductsEnEstaSesion = true;
  }, []);

  const setFiltroActivo = (filtro) => {
    setFiltroActivoState(filtro);
    localStorage.setItem("filtroActivo", filtro);
  };

  console.log(products);

  //"products" puede ser undefined mientras todavía no responde la API
  //(ej: recién refrescada la página con un filtro distinto de "Todo" ya
  //guardado en localStorage).
  const productosFiltrados =
    !products || filtroActivo === "Todo"
      ? products
      : products.filter((product) => product.category === filtroActivo);

  return (
    <div className={style.mainContainer}>
      <NavBar />
      <div className={style.filters}>
        <Filtros filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} />
      </div>

      <div className={style.productListWrapper}>
        <div className={style.productList}>
          {productosFiltrados &&
            productosFiltrados.map((product) => (
              <Product key={product.id} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Products;

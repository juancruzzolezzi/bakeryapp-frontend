import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
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
  const { data, isLoading, isError } = useGetProductsQuery();
  const products = data;

  //Si volvemos acá desde Mercado Pago sin haber pagado (falló o quedó
  //pendiente), mostramos el cartel de error en primer plano. El carrito
  //queda cerrado (los productos siguen ahí adentro, solo no se abre
  //solo) para que el cartel sea lo único que se vea al volver.
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "failure" || payment === "pending") {
      setPaymentStatus(payment);
      setSearchParams({}, { replace: true });
      sessionStorage.removeItem("mpCheckoutIniciado");
    } else if (sessionStorage.getItem("mpCheckoutIniciado")) {
      // Se fue a Mercado Pago (ver cartHandlers.js) pero volvió sin que MP
      // agregara ?payment=... a la URL: no hubo un resultado definitivo
      // (ej: tocó "Volver al sitio" o el botón atrás antes de pagar), así
      // que avisamos con un tono neutro, no de error.
      setPaymentStatus("abandoned");
      sessionStorage.removeItem("mpCheckoutIniciado");
    }
  }, [searchParams, setSearchParams]);

  //Si volvés acá con el botón "atrás" del navegador (en vez de un link),
  //algunos navegadores (sobre todo en celular) no vuelven a cargar la
  //página: la restauran tal cual quedó en memoria (bfcache) — con el
  //modal de pago todavía en "Procesando..." y sin correr el chequeo de
  //arriba. "pageshow" con persisted=true detecta justo ese caso, y
  //forzamos un reload real para que todo arranque de cero.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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

  //Orden fijo de categorías para cuando se muestran todos los productos
  //(filtro "Todo"): las que no estén en esta lista van al final, en el
  //orden en que las devuelva la API.
  const ordenCategorias = ["Facturas", "Tortas", "Cookies", "Alfajores", "Sin TACC", "Vegano", "Infusiones"];

  //"products" puede ser undefined mientras todavía no responde la API
  //(ej: recién refrescada la página con un filtro distinto de "Todo" ya
  //guardado en localStorage).
  const productosFiltrados =
    !products
      ? products
      : filtroActivo === "Todo"
      ? [...products].sort(
          (a, b) =>
            ordenCategorias.indexOf(a.category) - ordenCategorias.indexOf(b.category)
        )
      : products.filter((product) => product.category === filtroActivo);

  //Entrada escalonada de las tarjetas: cada vez que cambia el filtro (o
  //llegan los productos por primera vez), aparecen una tras otra en vez
  //de todas de golpe.
  const productListRef = useRef(null);

  useEffect(() => {
    if (!productListRef.current) return;
    const cards = productListRef.current.children;
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05 }
    );
  }, [filtroActivo, productosFiltrados?.length]);

  return (
    <div className={style.mainContainer}>
      <NavBar />

      {paymentStatus && (
        <div
          className={style.paymentOverlay}
          data-payment-banner="true"
          onClick={() => setPaymentStatus(null)}
        >
          <div
            className={`${style.paymentBanner} ${
              paymentStatus === "abandoned"
                ? style.paymentBannerNeutral
                : style.paymentBannerError
            }`}
          >
            <button
              onClick={() => setPaymentStatus(null)}
              className={style.paymentBannerClose}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
            {paymentStatus === "abandoned" ? (
              <>
                <p className={style.paymentBannerTitle}>No completaste el pago</p>
                <p className={style.paymentBannerText}>
                  Tu carrito sigue igual que lo dejaste, podés retomarlo
                  cuando quieras.
                </p>
              </>
            ) : (
              <>
                <p className={style.paymentBannerTitle}>Algo salió mal</p>
                <p className={style.paymentBannerText}>
                  No pudimos confirmar tu pago. Tu carrito sigue igual que lo
                  dejaste, podés intentar de nuevo cuando quieras.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={style.intro}>
        <h1>Nuestros productos</h1>
        <p>Horneados frescos cada día, elegí una categoría o mirá todo.</p>
      </div>

      <div className={style.filters}>
        <Filtros filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} />
      </div>

      <div className={style.productListWrapper}>
        {isLoading && (
          <div className={style.productList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={style.skeletonCard}>
                <div className={style.skeletonPhoto} />
                <div className={style.skeletonBody}>
                  <div className={style.skeletonLine} style={{ width: "70%" }} />
                  <div className={style.skeletonLine} style={{ width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className={style.stateMessage}>
            No pudimos cargar los productos. Probá de nuevo en un rato.
          </p>
        )}

        {!isLoading && !isError && productosFiltrados && productosFiltrados.length === 0 && (
          <p className={style.stateMessage}>
            No hay productos en "{filtroActivo}" por ahora.
          </p>
        )}

        {!isLoading && !isError && productosFiltrados && productosFiltrados.length > 0 && (
          <>
            {/* Los primeros dos se muestran destacados (más grandes) solo
                con el filtro "Todo" — con una categoría puntual ya elegida
                no aporta destacar entre pocos. Van en su propia fila,
                AFUERA de la grilla de abajo: adentro de la grilla, según
                cuántas columnas entraran, el acomodo automático a veces
                los separaba en dos filas distintas y metía una tarjeta
                normal angosta al lado de uno de ellos. */}
            {filtroActivo === "Todo" && (
              <div className={style.featuredRow}>
                {productosFiltrados.slice(0, 2).map((product) => (
                  <Product key={product.id} product={product} featured />
                ))}
              </div>
            )}

            <div className={style.productList} ref={productListRef}>
              {(filtroActivo === "Todo"
                ? productosFiltrados.slice(2)
                : productosFiltrados
              ).map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
//Mismo orden de imports que ProductDetail.jsx (NavBar, BackToTop, Footer,
//Product): si difiere, el build de producción avisa "Conflicting order"
//en el CSS y con CI=true (Vercel) falla.
import NavBar from "../../components/Navs/NavBar/NavBar";
import BackToTop from "../../components/BackToTop/BackToTop";
import Footer from "../../components/Footer/Footer";
import Product from "../../components/Product/Product";
import { useGetProductsQuery } from "../../api/appApi";
import { useFavorites } from "../../hooks/useFavorites";
import { FREE_SHIPPING_THRESHOLD } from "../../constants/deliveryZones";
import style from "./Products.module.css";

//Variable de módulo (no useState): sobrevive mientras dure la sesión del
//navegador (navegar a Home y volver NO la reinicia), pero SÍ se reinicia
//en un refresh real (F5). Así se distingue "volviste navegando" (vuelve a
//"Todo") de "refrescaste la página" (mantiene el filtro guardado).
let yaSeMontoProductsEnEstaSesion = false;

//Orden fijo de categorías: las que no estén acá van al final, en el orden
//en que las devuelva la API.
const ORDEN_CATEGORIAS = ["Facturas", "Tortas", "Cookies", "Alfajores", "Sin TACC", "Vegano", "Infusiones"];

//Opciones del selector "Ordenar por". "recomendado" es el orden de
//siempre (por categoría y alfabético).
const ORDENES = [
  { value: "recomendado", label: "Recomendados" },
  { value: "vendidos", label: "Más vendidos" },
  { value: "precioAsc", label: "Precio: menor a mayor" },
  { value: "precioDesc", label: "Precio: mayor a menor" },
];

//Con "Todo" (y sin buscar ni ordenar distinto), cada categoría muestra
//solo estos primeros productos y un "Ver todas" para el resto.
const POR_CATEGORIA_EN_TODO = 4;

const indiceCategoria = (categoria) => {
  const i = ORDEN_CATEGORIAS.indexOf(categoria);
  return i === -1 ? ORDEN_CATEGORIAS.length : i;
};

const compararRecomendado = (a, b) =>
  indiceCategoria(a.category) - indiceCategoria(b.category) ||
  a.title.localeCompare(b.title, "es");

//El buscador no distingue mayúsculas ni acentos.
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const Products = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const { favorites } = useFavorites();
  const cartList = useSelector((state) => state.homeSlice.cartList);

  //Si volvemos acá desde Mercado Pago sin haber pagado (falló o quedó
  //pendiente), mostramos el cartel en primer plano.
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "failure" || payment === "pending") {
      setPaymentStatus(payment);
      setSearchParams({}, { replace: true });
      sessionStorage.removeItem("mpCheckoutIniciado");
    } else if (sessionStorage.getItem("mpCheckoutIniciado")) {
      // Se fue a Mercado Pago (ver cartHandlers.js) pero volvió sin
      // resultado definitivo (ej: "Volver al sitio" antes de pagar).
      setPaymentStatus("abandoned");
      sessionStorage.removeItem("mpCheckoutIniciado");
    }
  }, [searchParams, setSearchParams]);

  //Volver con "atrás" puede restaurar la página congelada (bfcache), con
  //el modal de pago todavía en "Procesando...": se fuerza un reload real.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  //El filtro elegido se guarda en localStorage para mantenerlo en un F5,
  //pero si se vuelve navegando en la misma sesión arranca en "Todo". El
  //inicializador solo lee (tiene que ser puro); la escritura va en el
  //useEffect de abajo.
  //Si se llega desde el link de categoría del detalle de un producto
  //(state.categoria), arranca con esa categoría elegida.
  const location = useLocation();
  const [filtroActivo, setFiltroActivoState] = useState(() =>
    location.state?.categoria ||
    (yaSeMontoProductsEnEstaSesion ? "Todo" : localStorage.getItem("filtroActivo") || "Todo")
  );
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recomendado");

  useEffect(() => {
    if (yaSeMontoProductsEnEstaSesion) localStorage.setItem("filtroActivo", "Todo");
    yaSeMontoProductsEnEstaSesion = true;
  }, []);

  const toolbarRef = useRef(null);

  const setFiltroActivo = useCallback((filtro) => {
    setFiltroActivoState(filtro);
    localStorage.setItem("filtroActivo", filtro);
  }, []);

  //"Ver todas" de una categoría: filtra y sube hasta la barra de
  //búsqueda, para que se vea el resultado desde arriba.
  const verCategoria = (categoria) => {
    setFiltroActivo(categoria);
    toolbarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  //Categorías para los círculos de arriba, cada una con la foto de su
  //primer producto (así se actualizan solas si cambia el catálogo).
  const categorias = useMemo(() => {
    if (!products) return [];
    const porCategoria = new Map();
    [...products].sort(compararRecomendado).forEach((p) => {
      if (!porCategoria.has(p.category)) porCategoria.set(p.category, p.images?.[0]);
    });
    return [...porCategoria.entries()].map(([nombre, imagen]) => ({ nombre, imagen }));
  }, [products]);

  //Los demás órdenes desempatan con el recomendado, así dos productos con
  //el mismo precio (o las mismas ventas) no cambian de lugar entre renders.
  const compararProductos = useCallback(
    (a, b) => {
      const diff =
        orden === "vendidos"
          ? (b.sold || 0) - (a.sold || 0)
          : orden === "precioAsc"
          ? a.price - b.price
          : orden === "precioDesc"
          ? b.price - a.price
          : 0;
      return diff || compararRecomendado(a, b);
    },
    [orden]
  );

  const productosFiltrados = useMemo(() => {
    if (!products) return [];
    const texto = normalizar(busqueda.trim());
    return products
      .filter((p) =>
        filtroActivo === "Todo"
          ? true
          : filtroActivo === "Favoritos"
          ? favorites.includes(p.id)
          : p.category === filtroActivo
      )
      .filter((p) => !texto || normalizar(p.title).includes(texto))
      .sort(compararProductos);
  }, [products, filtroActivo, favorites, busqueda, compararProductos]);

  //Vista "vitrina": agrupada por categoría con títulos. Solo tiene sentido
  //con "Todo", sin búsqueda y en el orden recomendado; en cualquier otro
  //caso se muestra una sola grilla con el resultado tal cual.
  const agrupado = filtroActivo === "Todo" && orden === "recomendado" && !busqueda.trim();

  const grupos = useMemo(() => {
    if (!agrupado) return [];
    const map = new Map();
    productosFiltrados.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    });
    return [...map.entries()];
  }, [agrupado, productosFiltrados]);

  //Barra flotante del pedido (abajo): cantidad, total y cuánto falta para
  //el envío gratis. Abre el carrito de NavBar con el evento "abrir-carrito".
  const unidades = cartList.reduce((sum, p) => sum + p.quantity, 0);
  const subtotal = cartList.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const faltaEnvioGratis = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const tituloResultado =
    filtroActivo === "Todo" ? "Todos los productos" : filtroActivo;

  return (
    <div className={`catalogoClaro ${style.mainContainer}`}>
      <NavBar claro />

      {paymentStatus && (
        <div
          className={style.paymentOverlay}
          data-payment-banner="true"
          onClick={() => setPaymentStatus(null)}
        >
          <div
            className={`${style.paymentBanner} ${
              paymentStatus === "abandoned" ? style.paymentBannerNeutral : style.paymentBannerError
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
                  Tu carrito sigue igual que lo dejaste, podés retomarlo cuando quieras.
                </p>
              </>
            ) : (
              <>
                <p className={style.paymentBannerTitle}>Algo salió mal</p>
                <p className={style.paymentBannerText}>
                  No pudimos confirmar tu pago. Tu carrito sigue igual que lo dejaste,
                  podés intentar de nuevo cuando quieras.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={style.heroBand}>
        <header className={style.hero}>
          <div className={style.heroInner}>
            <div className={style.heroText}>
              <p className={style.eyebrow}>Catálogo</p>
              <h1 className={style.heroTitle}>
                Horneado hoy, <em>elegí el tuyo</em>
              </h1>
              <ul className={style.heroPills}>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
                  Delivery en Belgrano y alrededores
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
                  Envío gratis desde ${FREE_SHIPPING_THRESHOLD.toLocaleString("es-AR")}
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                  Tortas con 48 hs de anticipación
                </li>
              </ul>
            </div>
            <div className={style.heroPhoto}>
              <img src="/Portada.jpg" alt="Panes y facturas recién horneados" fetchpriority="high" />
            </div>
          </div>
        </header>
      </div>

      <div className={style.content}>
        {/* Categorías: círculos con foto. En celular se desliza de costado. */}
        <nav className={style.categoryRail} aria-label="Categorías">
          <button
            type="button"
            className={`${style.category} ${filtroActivo === "Todo" ? style.categoryOn : ""}`}
            onClick={() => setFiltroActivo("Todo")}
            aria-pressed={filtroActivo === "Todo"}
          >
            <span className={style.categoryRing}>
              <img src="/Portada.jpg" alt="" className={style.categoryImg} />
            </span>
            Todo
          </button>
          {categorias.map((c) => (
            <button
              type="button"
              key={c.nombre}
              className={`${style.category} ${filtroActivo === c.nombre ? style.categoryOn : ""}`}
              onClick={() => setFiltroActivo(c.nombre)}
              aria-pressed={filtroActivo === c.nombre}
            >
              <span className={style.categoryRing}>
                {c.imagen && <img src={c.imagen} alt="" className={style.categoryImg} loading="lazy" />}
              </span>
              {c.nombre}
            </button>
          ))}
        </nav>

        <div className={style.toolbar} ref={toolbarRef}>
          <label className={style.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar medialunas, tortas, cookies…"
              aria-label="Buscar producto"
            />
          </label>

          <button
            type="button"
            className={`${style.favToggle} ${filtroActivo === "Favoritos" ? style.favToggleOn : ""}`}
            onClick={() => setFiltroActivo(filtroActivo === "Favoritos" ? "Todo" : "Favoritos")}
            aria-pressed={filtroActivo === "Favoritos"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={filtroActivo === "Favoritos" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            Favoritos
            {favorites.length > 0 && <span className={style.favCount}>{favorites.length}</span>}
          </button>

          <label className={style.sort}>
            <span>Ordenar</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              {ORDENES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </label>

          {!isLoading && !isError && (
            <span className={style.count}>
              {productosFiltrados.length} producto{productosFiltrados.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {isLoading && (
          <div className={style.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={style.skeletonCard} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <p className={style.stateMessage}>
            No pudimos cargar los productos. Probá de nuevo en un rato.
          </p>
        )}

        {!isLoading && !isError && productosFiltrados.length === 0 && (
          <p className={style.stateMessage}>
            {busqueda.trim()
              ? `No encontramos productos que coincidan con "${busqueda}".`
              : filtroActivo === "Favoritos"
              ? "Todavía no marcaste ningún favorito. Tocá el corazón de un producto para guardarlo acá."
              : `No hay productos en "${filtroActivo}" por ahora.`}
          </p>
        )}

        {!isLoading && !isError && productosFiltrados.length > 0 && agrupado &&
          grupos.map(([categoria, lista]) => (
            <section key={categoria} className={style.group} aria-labelledby={`cat-${categoria}`}>
              <div className={style.groupHeader}>
                <h2 id={`cat-${categoria}`} className={style.groupTitle}>
                  {categoria}
                  <span className={style.groupCount}>
                    {lista.length} producto{lista.length === 1 ? "" : "s"}
                  </span>
                </h2>
                {lista.length > POR_CATEGORIA_EN_TODO && (
                  <button type="button" className={style.seeAll} onClick={() => verCategoria(categoria)}>
                    Ver todas →
                  </button>
                )}
              </div>
              <div className={style.grid}>
                {lista.slice(0, POR_CATEGORIA_EN_TODO).map((product) => (
                  <Product key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

        {!isLoading && !isError && productosFiltrados.length > 0 && !agrupado && (
          <section className={style.group} aria-labelledby="resultado">
            <div className={style.groupHeader}>
              <h2 id="resultado" className={style.groupTitle}>
                {busqueda.trim() ? `Resultados para "${busqueda.trim()}"` : tituloResultado}
              </h2>
              {filtroActivo !== "Todo" && (
                <button type="button" className={style.seeAll} onClick={() => setFiltroActivo("Todo")}>
                  Ver todo el catálogo →
                </button>
              )}
            </div>
            <div className={style.grid}>
              {productosFiltrados.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {unidades > 0 && (
        <div className={style.cartBar} role="region" aria-label="Tu pedido">
          <div className={style.cartBarInfo}>
            <div className={style.cartBarTop}>
              <strong>
                {unidades} {unidades === 1 ? "unidad" : "unidades"} en tu pedido
              </strong>
              <span>
                {faltaEnvioGratis > 0
                  ? `Te faltan $${faltaEnvioGratis.toLocaleString("es-AR")} para envío gratis`
                  : "¡Envío gratis!"}
              </span>
            </div>
            <div className={style.cartBarTrack} aria-hidden="true">
              <div
                className={style.cartBarFill}
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            className={style.cartBarBtn}
            onClick={() => window.dispatchEvent(new Event("abrir-carrito"))}
            data-cart-toggle="true"
          >
            Ver pedido · ${subtotal.toLocaleString("es-AR")}
          </button>
        </div>
      )}

      <div className={style.footerBand}>
        <Footer />

        {/* Deja lugar abajo para que la barra flotante no tape el footer. */}
        {unidades > 0 && <div className={style.cartBarSpacer} aria-hidden="true" />}
      </div>

      <BackToTop />
    </div>
  );
};

export default Products;

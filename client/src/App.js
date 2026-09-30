//React
import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
//Views: cada una en su propio chunk (React.lazy), no todas juntas en el
//bundle principal. Antes, visitar el Home también descargaba y parseaba
//el código de Productos (con GSAP incluido), el Carrito, el FAQ, etc.
//aunque nunca se usaran en esa visita — eso pesa en la carga inicial de
//toda la app. "Loading" NO va acá: es chiquito y hace falta enseguida
//como fallback de "Suspense" más abajo.
import Loading from "./components/Loading/Loading";
import InstallAppBanner from "./components/InstallAppBanner/InstallAppBanner";
import ErrorBoundary, { RELOAD_FLAG } from "./components/ErrorBoundary/ErrorBoundary";
//Estilos
import "./App.css";

const Home = lazy(() => import("./views/Home/Home"));
const Products = lazy(() => import("./views/Products/Products"));
const ProductDetail = lazy(() => import("./views/ProductDetail/ProductDetail"));
const Nosotros = lazy(() => import("./views/Nosotros/Nosotros"));
const Contactanos = lazy(() => import("./views/Contactanos/Contactanos"));
const PreguntasFrecuentes = lazy(() => import("./views/PreguntasFrecuentes/PreguntasFrecuentes"));
const NotFound = lazy(() => import("./views/NotFound/NotFound"));
const Privacidad = lazy(() => import("./views/Legal/Privacidad"));
const Terminos = lazy(() => import("./views/Legal/Terminos"));
const CambiosDevoluciones = lazy(() => import("./views/Legal/CambiosDevoluciones"));
const Arrepentimiento = lazy(() => import("./views/Legal/Arrepentimiento"));


function App() {
  //useLocation: sirve para acceder al objeto "location" que contiene informacion sobre la URL actual del navegador
  const location = useLocation();

  //Al cambiar de página, arranca desde arriba (si no, al pasar de una
  //página larga a otra se quedaba scrolleado a la misma altura).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  //Si en algún momento un chunk falló y ErrorBoundary tuvo que recargar la
  //página sola (ver ErrorBoundary.jsx), esto borra esa marca apenas la app
  //vuelve a levantar bien: así, si pasa de nuevo más adelante en la misma
  //pestaña (ej: después del próximo deploy), se puede volver a intentar el
  //auto-reload en vez de quedar bloqueado por el intento anterior.
  useEffect(() => {
    sessionStorage.removeItem(RELOAD_FLAG);
  }, []);



  return (
    <div className="App">
      <img
        src="/Portada.jpg"
        alt="fondo"
        className="background-image"
        data-print-hide
        //Fondo de toda la app, siempre visible desde el primer momento:
        //con prioridad alta el navegador la baja antes que el resto.
        fetchpriority="high"
        decoding="async"
      ></img>

      {/* "key": cada cambio de ruta vuelve a montar este div, y con eso
          se repite el fade de entrada (ver .fadeRoutes en App.css). Antes
          había además un spinner fijo de 1s en CADA navegación, aunque la
          página ya estuviera lista: ahora solo aparece el de "Suspense",
          mientras de verdad se descarga el código de la página. */}
      <div className="fadeRoutes" key={location.pathname}>
        {/* "Suspense": mientras se descarga el chunk de la página pedida
            (ver los "lazy(...)" de arriba), muestra el mismo spinner de
            siempre en vez de una pantalla en blanco.
            "ErrorBoundary" cubre el caso en que esa descarga directamente
            falla (ej: justo después de un deploy nuevo, con el navegador
            todavía apuntando a una versión vieja): sin esto, React
            desmontaba todo en silencio y quedaba una pantalla en blanco
            hasta que alguien refrescara a mano. */}
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/contactanos" element={<Contactanos />} />
              <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/terminos" element={<Terminos />} />
              <Route path="/cambios-y-devoluciones" element={<CambiosDevoluciones />} />
              <Route path="/arrepentimiento" element={<Arrepentimiento />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      <InstallAppBanner />
    </div>
  );
};

export default App;

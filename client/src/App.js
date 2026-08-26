//React
import React, { useState, useEffect, Suspense, lazy } from "react";
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


function App() {
  //Estado local
  const [isLoading, setIsLoading] = useState(true);

  //useLocation: sirve para acceder al objeto "location" que contiene informacion sobre la URL actual del navegador
  const location = useLocation();

  //useEffect: permite ejecutar codigo JS luego de cada renderizacion de componente, tanto montaje como actualizacion
  useEffect(() => {
    //Seta al estado local "isLoading" en true 
    setIsLoading(true);
    
    //1s (1000ms) despues de que el componente se haya montado o actualizado, "isLoading" se vuelve False
    const delayLoading = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(delayLoading);//la ejecucion de un useEffect termina cuando el componente se elimina del DOM(se desmonta) o antes de que cambie el estado de alguna de las dependencias

  }, [location.pathname]);//El array de dependencias sirve para ejecutar useEffect luego de que dicha dependencia cambie de estado

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

      {isLoading && <Loading/>}
      <div className={`fadeRoutes ${isLoading ? "fadeRoutesOut" : "fadeRoutesIn"}`}>
        {/* "Suspense": mientras se descarga el chunk de la página pedida
            (ver los "lazy(...)" de arriba), muestra el mismo spinner de
            siempre en vez de una pantalla en blanco. En la mayoría de los
            casos ni se llega a ver: el spinner de "isLoading" (1s, fijo
            por diseño) ya cubre ese tiempo.
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

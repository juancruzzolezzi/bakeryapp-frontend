//React
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
//Views
import Home from "./views/Home/Home";
import Products from "./views/Products/Products";
import Loading from "./components/Loading/Loading";
import Nosotros from "./views/Nosotros/Nosotros";
import Contactanos from "./views/Contactanos/Contactanos";
import PreguntasFrecuentes from "./views/PreguntasFrecuentes/PreguntasFrecuentes";
import NotFound from "./views/NotFound/NotFound";
//Estilos
import "./App.css";


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
  


  return (
    <div className="App">
      <img src="/Portada.jpg" alt="fondo" className="background-image"></img>

      {isLoading && <Loading/>}
      <div className={`fadeRoutes ${isLoading ? "fadeRoutesOut" : "fadeRoutesIn"}`}>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contactanos" element={<Contactanos />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

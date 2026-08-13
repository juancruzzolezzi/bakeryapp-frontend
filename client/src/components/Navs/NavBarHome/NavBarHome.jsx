//Dependencias de REACT
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
//Importacion de estilos
import style from "./NavBarHome.module.css";
//Dependencias de GSAP
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
//Esta funcion sirve para registrar el plugin "ScrollTrigger" y poder usar sus funciones a traves de gsap()
gsap.registerPlugin( ScrollTrigger);



const NavBarHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú "MENÚ" al hacer click en cualquier lugar que no sea el
  // menú en sí ni el botón que lo abre. Fase de captura (igual que en
  // Cart.jsx) para no depender del orden en que React procese el click.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      if (event.target.closest("[data-menu-toggle]")) return;
      setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [isOpen]);

  return (
    <nav className={style.navbar}>
      <div className={isOpen ? `${style.navOpen}` : `${style.nav}`}>
        <div
          onClick={() => setIsOpen(true)}
          className={style.btnMenu}
          data-menu-toggle="true"
        >
          MENÚ
        </div>
      </div>

      <div
        ref={menuRef}
        className={isOpen ? `${style.contenidoOpen}` : `${style.contenido}`}
      >
        <div className={style.buttonCont}>
          <button onClick={() => setIsOpen(false)} className={style.cerrar}>
            x
          </button>
        </div>

        <div className={style.linksCont}>
          <Link to="/" className={style.navLink}>
            <div className={style.btn}>HOME</div>
          </Link>

          <Link to="/products" className={style.navLink}>
            <div className={style.btn}> COCINA </div>
          </Link>

          <Link to="/contactanos" className={style.navLink}>
            <div className={style.btn}> CONTACTANOS </div>
          </Link>

          <Link to="/nosotros" className={style.navLink}>
            <div className={style.btn}> NOSOTROS </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBarHome;

//Nombres con los que voy a manipular los elementos del DOM
// const HomeRef = useRef(null)
// const CocinaRef = useRef(null)
// const NosotrosRef = useRef(null)


// const AnimacionGSAP = (RefName, x, y ) => {
// //AnimacionesGSAP recibe 3 paramentros:
// //primer parametro: Referencia al elemento del DOM que se va a animar
// //segundo parametro: valo del desplazamiento en el eje x
// //tercer parametro: valor de desplazamiento en el eje y
//   gsap.to(RefName.current, {
//     scrollTrigger: {
//       trigger: RefName.current,
//       start: "top 0%",
//       end: "bottom center",
//       scrub: true,
//     },
//     x: x, 
//     y: y,
//   })

// }

// useEffect(() => {
    
//   AnimacionGSAP(HomeRef, -1080, -185);
//   AnimacionGSAP(CocinaRef, -590, -275);
//   AnimacionGSAP(NosotrosRef, -85, -365);

// }, []);
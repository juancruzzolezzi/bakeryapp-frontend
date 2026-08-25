//Dependencias de REACT
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
//Importacion de estilos
import style from "./NavBarHome.module.css";
import { NAV_LINKS } from "../../../constants/navLinks";
//Dependencias de GSAP
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
//Esta funcion sirve para registrar el plugin "ScrollTrigger" y poder usar sus funciones a traves de gsap()
gsap.registerPlugin( ScrollTrigger);



const NavBarHome = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

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
      {/* Solo visible en pantallas grandes (ver media query): en mobile
          queda oculta y se usa el botón "MENÚ" con el panel de abajo. */}
      <div className={style.desktopLinks}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`${style.desktopLink} ${
              location.pathname === link.to ? style.desktopLinkActive : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className={isOpen ? `${style.navOpen}` : `${style.nav}`}>
        <div
          onClick={() => setIsOpen(true)}
          className={style.btnMenu}
          data-menu-toggle="true"
          role="button"
          aria-label="Abrir menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Fondo difuminado detrás de la tarjeta flotante: al ser un
          elemento aparte (no dentro de menuRef), tocarlo cuenta como
          "click afuera" y cierra el menú con la misma lógica de arriba. */}
      {isOpen && <div className={style.backdrop} />}

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
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={style.navLink}>
              <div className={style.btn}>
                <span className={style.btnLabel}>{link.label}</span>
              </div>
            </Link>
          ))}
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
//Dependencias de REACT
import React, { useState } from "react";
import { Link } from "react-router-dom";
//Importacion de estilos
import style from "./NavBarHome.module.css";
//Dependencias de GSAP
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
//Esta funcion sirve para registrar el plugin "ScrollTrigger" y poder usar sus funciones a traves de gsap()
gsap.registerPlugin( ScrollTrigger);



const NavBarHome = () => {
  const user = localStorage.getItem("userEmail");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={style.navbar}>
      <div className={isOpen ? `${style.navOpen}` : `${style.nav}`}>
        <div onClick={() => setIsOpen(true)} className={style.btnMenu}>
          MENÚ
        </div>
      </div>

      <div className={isOpen ? `${style.contenidoOpen}` : `${style.contenido}`}>
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

          <Link to="/nosotros" className={style.navLink}>
            <div className={style.btn}> NOSOTROS </div>
          </Link>

          {user ? (
            <Link to="/profile" className={style.navLink}>
              <div className={style.btn}> PERFIL </div>
            </Link>
          ) : (
            <Link to="/login" className={style.navLink}>
              <div className={style.btn}> LOG IN </div>
            </Link>
          )}
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
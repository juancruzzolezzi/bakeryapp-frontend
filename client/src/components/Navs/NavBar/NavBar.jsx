import React, { useState }from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import style from "./NavBar.module.css";
import Cart from "../../../views/Cart/Cart";

const NavBar = () => {
  const user = localStorage.getItem("userEmail");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenCartModal = () => {
    setIsCartOpen(true); // Abre el modal del carrito
  };

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

      <div className={style.cartBox} onClick={handleOpenCartModal}>
        <div className={style.cart}>
          <FontAwesomeIcon icon={faShoppingCart} />
        </div>
      </div>

      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </nav>
  );
};


export default NavBar;

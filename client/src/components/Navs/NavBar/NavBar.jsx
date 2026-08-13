import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import style from "./NavBar.module.css";
import Cart from "../../../views/Cart/Cart";

const NavBar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleOpenCartModal = () => {
    setIsCartOpen(true); // Abre el modal del carrito
  };

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

      <div className={style.cartBox}>
        <div
          className={style.cart}
          onClick={handleOpenCartModal}
          data-cart-toggle="true"
        >
          <FontAwesomeIcon icon={faShoppingCart} />
        </div>
      </div>

      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </nav>
  );
};


export default NavBar;

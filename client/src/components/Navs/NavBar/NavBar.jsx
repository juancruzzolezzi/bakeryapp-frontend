import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import style from "./NavBar.module.css";
import Cart from "../../../views/Cart/Cart";
import { NAV_LINKS } from "../../../constants/navLinks";

// TODO: ajustar cuánto tiempo sin abrir el carrito cuenta como "se olvidó".
const CART_REMINDER_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutos

const NavBar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  //Cantidad total de unidades en el carrito, para mostrar el "badge"
  //sobre el ícono (independiente de que el carrito esté abierto o no).
  const cartList = useSelector((state) => state.homeSlice.cartList);
  const cartItemsCount = cartList.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  //Recordatorio de "carrito abandonado": si hay productos y pasó bastante
  //tiempo desde la última vez que se abrió el carrito (ej: volvió al otro
  //día y se había olvidado), un anillo pulsante llama la atención sobre el
  //ícono hasta que lo abra. La primera vez que hay algo en el carrito en
  //este navegador no cuenta como "olvidado" (recién se agregó).
  const [showCartReminder, setShowCartReminder] = useState(false);

  useEffect(() => {
    if (cartItemsCount === 0) {
      setShowCartReminder(false);
      return;
    }

    const lastOpened = Number(localStorage.getItem("cartLastOpened"));
    if (!lastOpened) {
      localStorage.setItem("cartLastOpened", String(Date.now()));
      return;
    }

    setShowCartReminder(Date.now() - lastOpened > CART_REMINDER_THRESHOLD_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCartModal = () => {
    setIsCartOpen(true); // Abre el modal del carrito
    setShowCartReminder(false);
    localStorage.setItem("cartLastOpened", String(Date.now()));
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
    <>
      {/* Menú: NO es fixed, scrollea con la página (solo se ve arriba
          de todo, no se queda flotando encima de los productos). */}
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

      {/* Carrito: este sí queda fijo, siempre accesible sin importar el
          scroll. Mientras el menú está abierto, baja para no superponerse
          con él (que ahora arranca arriba de todo). */}
      <div
        className={
          isOpen
            ? `${style.cartFixed} ${style.cartFixedMenuOpen}`
            : style.cartFixed
        }
      >
        <div className={style.cartBox}>
          <div
            className={`${style.cart} ${showCartReminder ? style.cartReminder : ""}`}
            onClick={handleOpenCartModal}
            data-cart-toggle="true"
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {cartItemsCount > 0 && (
              // "key" fuerza a React a recrear el <span> cada vez que
              // cambia la cantidad, así la animación de "rebote" (ver
              // NavBar.module.css) se vuelve a disparar en cada cambio,
              // no solo la primera vez que aparece el badge.
              <span key={cartItemsCount} className={style.cartBadge}>
                {cartItemsCount}
              </span>
            )}
          </div>
        </div>

        <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      </div>
    </>
  );
};


export default NavBar;

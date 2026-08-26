//Dependencias de REACT
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
//Importacion de estilos
import style from "./NavBarHome.module.css";
import AccountButton from "../../Auth/AccountButton";
import { NAV_LINKS } from "../../../constants/navLinks";

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
    <>
    <nav className={style.navbar}>
      {/* Solo visible en pantallas grandes (ver media query): en mobile
          queda oculta y se usa el botón "MENÚ" con el panel de abajo. A la
          misma altura que los links (dentro de la misma fila), en vez de
          quedar flotando aparte con position:fixed. */}
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
        {/* Solo mobile (este bloque queda oculto en desktop, ver
            .nav/.navOpen): "Ingresar" va después del hamburguesa, los dos
            pegados como unidad al borde derecho real de la pantalla. */}
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
        <AccountButton />
      </div>

      {/* Solo desktop (ver media query): pegado al borde derecho REAL de
          la pantalla, no al de .desktopLinks (que es un bloque angosto y
          centrado, por eso antes "Ingresar" se veía cerca del medio). Al
          ser "absolute" dentro de .navbar (que ya es "absolute", no
          "fixed"), scrollea con el resto del menú y desaparece al bajar,
          en vez de quedar siempre visible. */}
      <div className={style.accountSlot}>
        <AccountButton />
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
    </>
  );
};

export default NavBarHome;
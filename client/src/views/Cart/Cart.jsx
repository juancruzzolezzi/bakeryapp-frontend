import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useCartHandlers } from "../../handlers/cartHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { updateCart, addToCart } from "../../redux/slice/homeSlice";
import { useGetProductsQuery } from "../../api/appApi";
import { useAuthModal } from "../../context/AuthModalContext";
import { isStandalone } from "../../utils/pwa";
import EmptyCartModal from "../../components/Modals/EmptyCartModal";
import ProductCart from "../../components/ProductCart/ProductCart";
import { CONTACTO } from "../../constants/contacto";
import { ACCOUNT_DISCOUNT_RATE } from "../../utils/discount";
import { FREE_SHIPPING_THRESHOLD } from "../../constants/deliveryZones";
import style from "./Cart.module.css";

// Más viejo que esto, "Repetir pedido" deja de ofrecerse: pasado un mes ya
// no tiene mucho sentido (productos de temporada, precios desactualizados).
const LAST_ORDER_MAX_AGE_DAYS = 30;

const formatearPrecio = (monto) => `$${Math.round(monto).toLocaleString("es-AR")}`;

// "Ideal con tu pedido": si todavía no lleva nada para tomar, un café; si
// ya lleva, el más vendido de lo que no está en el carrito.
const elegirSugerido = (productos, cartList) => {
  if (!productos?.length) return null;
  const enCarrito = new Set(cartList.map((p) => String(p.id)));
  const candidatos = productos.filter((p) => !enCarrito.has(String(p.id)));
  const llevaBebida = cartList.some((p) => p.category === "Infusiones");
  if (!llevaBebida) {
    const cafe =
      candidatos.find((p) => p.title === "Café de Especialidad") ||
      candidatos.find((p) => p.category === "Infusiones");
    if (cafe) return cafe;
  }
  return [...candidatos].sort((a, b) => (b.sold || 0) - (a.sold || 0))[0] || null;
};

function Cart({ isCartOpen, setIsCartOpen }) {

  const cartList = useSelector((state) => state.homeSlice.cartList);
  const user = useSelector((state) => state.authSlice.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openAuthModal = useAuthModal();

  //Último pedido confirmado (ver cartHandlers.js, se guarda justo antes de
  //ir a pagar a Mercado Pago), para ofrecer "repetir pedido" con el
  //carrito vacío en vez de que el cliente arme todo de nuevo a mano. Si ya
  //pasó demasiado tiempo, se ignora (no tiene sentido repetir algo viejo).
  const [lastOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lastOrder"));
      if (!saved?.date) return saved;

      const ageInDays =
        (Date.now() - new Date(saved.date).getTime()) / (1000 * 60 * 60 * 24);
      return ageInDays > LAST_ORDER_MAX_AGE_DAYS ? null : saved;
    } catch {
      return null;
    }
  });

  const repetirPedido = () => {
    if (!lastOrder?.items?.length) return;
    dispatch(updateCart(lastOrder.items));
  };

  //Arma el pedido como texto y lo abre en WhatsApp, para quien prefiere
  //coordinar por chat antes de pagar por Mercado Pago.
  const compartirPorWhatsApp = () => {
    const detalle = cartList
      .map((product) => `${product.quantity}x ${product.title} - ${formatearPrecio(product.price * product.quantity)}`)
      .join("\n");

    const mensaje = `Hola! Quiero hacer este pedido:\n${detalle}\n\nTotal: ${formatearPrecio(totalPrice)}`;

    window.open(
      `https://wa.me/${CONTACTO.whatsappNumero}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  const totalPrice = cartList.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const unidades = cartList.reduce((sum, product) => sum + product.quantity, 0);

  //10% OFF para cuentas registradas (ver utils/discount.js): se muestra
  //acá para que se vea reflejado en el subtotal, pero el monto real que se
  //cobra lo calcula el backend en base al token de sesión, no a esto.
  const isLoggedIn = Boolean(user);
  const discountAmount = isLoggedIn ? totalPrice * ACCOUNT_DISCOUNT_RATE : 0;
  const discountedTotalAnimado = useAnimatedNumber(totalPrice - discountAmount);
  const totalPriceAnimado = useAnimatedNumber(totalPrice);
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);

  //Sugerencia "Ideal con tu pedido" (el catálogo ya está en caché: lo
  //pide useCartSync cuando hay algo en el carrito).
  const { data: productos } = useGetProductsQuery(undefined, { skip: !isCartOpen });
  const sugerido = useMemo(() => elegirSugerido(productos, cartList), [productos, cartList]);

  //Referencia al panel del carrito, para detectar clicks afuera de él
  const cartRef = useRef(null);

  //Guarda la cantidad TOTAL de unidades del render anterior. Así se
  //detecta tanto "se agregó un producto nuevo" como "se sumó una unidad
  //más de uno que ya estaba", sin confundirlo con "ya había productos
  //cuando se montó este componente" (no debería abrirse solo).
  const totalQuantity = (list) =>
    list.reduce((sum, product) => sum + product.quantity, 0);
  const prevQuantityRef = useRef(totalQuantity(cartList));

  // Destructuring de funciones dentro de useCartHandlers
  const { handleModalYes, handleModalCancel } = useCartHandlers(
    setModalEmptyOpen,
    setIsCartOpen
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartList));
  }, [cartList]);

  useEffect(() => {
    const prevQuantity = prevQuantityRef.current;
    const currentQuantity = totalQuantity(cartList);

    if (cartList.length === 0) {
      // Si se queda sin productos (ej: se borró el último), se cierra solo.
      setIsCartOpen(false);
    } else if (currentQuantity > prevQuantity) {
      // Se abre solo cuando suman más unidades, no simplemente porque ya
      // tenía productos al montarse este componente.
      setIsCartOpen(true);
    }

    prevQuantityRef.current = currentQuantity;
  }, [cartList, setIsCartOpen]);

  //Cierra el carrito al hacer click en cualquier lugar de la pantalla que no
  //sea el carrito en sí ni el botón "Agregar" de un producto. Se ignora
  //mientras haya CUALQUIER modal abierto (react-modal agrega la clase
  //"ReactModal__Body--open" al <body> mientras haya uno abierto).
  useEffect(() => {
    if (!isCartOpen) return;

    const handleClickOutside = (event) => {
      if (document.body.classList.contains("ReactModal__Body--open")) return;
      if (cartRef.current && cartRef.current.contains(event.target)) return;
      if (event.target.closest("[data-product-card]")) return;
      if (event.target.closest("[data-cart-toggle]")) return;
      if (event.target.closest("[data-payment-banner]")) return;

      setIsCartOpen(false);
    };

    // Fase de CAPTURA: se mira el estado antes de que React procese el
    // mismo click (ver historial de este archivo).
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [isCartOpen, setIsCartOpen]);

  const irAPagar = () => {
    setIsCartOpen(false);
    navigate("/pagar");
  };

  if (!isCartOpen) return null;
  return (
    <>
      {/* Fondo oscuro detrás de la hoja (solo en el celular, ver CSS).
          Tocarlo cuenta como "click afuera" y cierra el carrito. */}
      <div className={style.backdrop} aria-hidden="true" />

      <div className={style.mainContainer} ref={cartRef} role="dialog" aria-label="Tu pedido">
        <span className={style.grabber} aria-hidden="true" />

        <div className={style.header}>
          <div className={style.headerText}>
            <h3 className={style.title}>Tu pedido</h3>
            {cartList.length > 0 && (
              <span className={style.count}>
                {unidades} {unidades === 1 ? "unidad" : "unidades"}
                <span aria-hidden="true"> · </span>
                <button type="button" onClick={() => setModalEmptyOpen(true)} className={style.textBtn}>
                  Vaciar
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className={style.closeBtn}
            aria-label="Cerrar carrito"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {cartList.length === 0 ? (
          <div className={style.emptyState}>
            <h4>Tu pedido está vacío</h4>
            <p>Todavía no agregaste nada. Mirá lo que horneamos hoy.</p>
            <Link
              to="/products"
              className={style.emptyCta}
              onClick={() => setIsCartOpen(false)}
            >
              Ver productos
            </Link>

            {lastOrder?.items?.length > 0 && (
              <div className={style.lastOrder}>
                <span className={style.lastOrderLabel}>
                  Tu último pedido
                  {lastOrder.date &&
                    ` (${new Date(lastOrder.date).toLocaleDateString("es-AR")})`}
                </span>
                {lastOrder.items.map((product) => (
                  <div key={product.id} className={style.lastOrderRow}>
                    <span>
                      {product.quantity}x {product.title}
                    </span>
                  </div>
                ))}
                <button type="button" onClick={repetirPedido} className={style.lastOrderBtn}>
                  Repetir pedido
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={style.scroll}>
              <div className={style.items}>
                {/* "product.id" (no "index"): ver ProductCart.jsx, cada fila
                    tiene su propio estado para la animación de salida. */}
                {cartList.map((product) => (
                  <ProductCart product={product} key={product.id} />
                ))}
              </div>

              {sugerido && (
                <div className={style.suggestion}>
                  <span className={style.suggestionLabel}>Ideal con tu pedido</span>
                  <div className={style.suggestionCard}>
                    {sugerido.images?.[0] && (
                      <img src={sugerido.images[0]} alt="" className={style.suggestionImg} />
                    )}
                    <span className={style.suggestionText}>
                      <span className={style.suggestionTitle}>{sugerido.title}</span>
                      <span className={style.suggestionPrice}>{formatearPrecio(sugerido.price)}</span>
                    </span>
                    <button
                      type="button"
                      className={style.suggestionBtn}
                      onClick={() => dispatch(addToCart({ ...sugerido, quantity: 1 }))}
                      aria-label={`Sumar ${sugerido.title} al pedido`}
                    >
                      + Sumar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={style.summary}>
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <div className={style.summaryTop}>
                  <span className={style.freeChip}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Envío gratis
                  </span>
                  <span className={style.totalAmount}>{formatearPrecio(discountedTotalAnimado)}</span>
                </div>
              ) : (
                <>
                  <div className={style.shipping}>
                    <span className={style.shippingMsg}>
                      Te faltan {formatearPrecio(FREE_SHIPPING_THRESHOLD - totalPriceAnimado)} para envío gratis
                    </span>
                    <div className={style.shippingTrack}>
                      <div
                        className={style.shippingFill}
                        style={{ width: `${Math.min((totalPriceAnimado / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className={style.summaryTop}>
                    <span className={style.totalLabel}>Total</span>
                    <span className={style.totalAmount}>{formatearPrecio(discountedTotalAnimado)}</span>
                  </div>
                </>
              )}

              {isLoggedIn && (
                <div className={style.discountRow}>
                  <span>Incluye 10% OFF por tu cuenta</span>
                  <span>-{formatearPrecio(discountAmount)}</span>
                </div>
              )}

              <button type="button" onClick={irAPagar} className={style.payBtn}>
                Ir a pagar
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>

              <div className={style.footerLinks}>
                {!isLoggedIn && isStandalone() && (
                  <span>
                    Con tu cuenta pagás {formatearPrecio(totalPrice * (1 - ACCOUNT_DISCOUNT_RATE))}.{" "}
                    <button type="button" className={style.textBtn} onClick={() => openAuthModal("login")}>
                      Ingresar
                    </button>
                  </span>
                )}
                <button type="button" onClick={compartirPorWhatsApp} className={style.textBtn}>
                  Prefiero coordinar por WhatsApp
                </button>
              </div>
            </div>
          </>
        )}

        <EmptyCartModal
          isOpen={isModalEmptyOpen}
          onCancel={handleModalCancel}
          onConfirm={handleModalYes}
        />
      </div>
    </>
  );
};

export default Cart;

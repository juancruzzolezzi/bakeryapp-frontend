import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useCartHandlers } from "../../handlers/cartHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { updateCart } from "../../redux/slice/homeSlice";
import PaymentModal from "../../components/Modals/PaymentModal";
import EmptyCartModal from "../../components/Modals/EmptyCartModal";
import ProductCart from "../../components/ProductCart/ProductCart";
import { CONTACTO } from "../../constants/contacto";
import style from "./Cart.module.css";

// TODO: ajustar al monto mínimo real que definan para envío gratis.
const FREE_SHIPPING_THRESHOLD = 15000;

// Más viejo que esto, "Repetir pedido" deja de ofrecerse: pasado un mes ya
// no tiene mucho sentido (productos de temporada, precios desactualizados).
const LAST_ORDER_MAX_AGE_DAYS = 30;

function Cart({ isCartOpen, setIsCartOpen }) {

  const cartList = useSelector((state) => state.homeSlice.cartList);
  const dispatch = useDispatch();

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
      .map((product) => `${product.quantity}x ${product.title} - $${(
        product.price * product.quantity
      ).toLocaleString("es-AR")}`)
      .join("\n");

    const mensaje = `Hola! Quiero hacer este pedido:\n${detalle}\n\nTotal: $${totalPrice.toLocaleString(
      "es-AR"
    )}`;

    window.open(
      `https://wa.me/${CONTACTO.whatsappNumero}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  //Estados locales
  const [totalPrice, setTotalPrice] = useState(0);
  const totalPriceAnimado = useAnimatedNumber(totalPrice);
  const [isModalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);

  //Referencia al panel del carrito, para detectar clicks afuera de él
  const cartRef = useRef(null);

  //Guarda la cantidad TOTAL de unidades (sumando quantity de cada
  //producto, no solo cuántas líneas distintas hay) del render anterior.
  //Así se detecta tanto "se agregó un producto nuevo" como "se sumó una
  //unidad más de uno que ya estaba" (mismo largo de lista, pero más
  //unidades), sin confundirlo con "ya había productos cuando se montó
  //este componente" (ej: volviste a /products después de haber estado
  //en otra página con cosas en el carrito; no debería abrirse solo).
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

    const totalSum = cartList.reduce(
      (sum, product) => sum + product.price * product.quantity, // Recalcula el total
      0
    );
    setTotalPrice(totalSum);
  }, [cartList]);

  useEffect(() => {
    const prevQuantity = prevQuantityRef.current;
    const currentQuantity = totalQuantity(cartList);

    if (cartList.length === 0) {
      // Si se queda sin productos (ej: se borró el último), se cierra solo.
      setIsCartOpen(false);
    } else if (currentQuantity > prevQuantity) {
      // Se abre solo cuando suman más unidades (agregar un producto nuevo,
      // o sumar una unidad más de uno que ya estaba), no simplemente
      // porque ya tenía productos al montarse este componente (ej: volver
      // a /products con cosas ya agregadas antes).
      setIsCartOpen(true);
    }

    prevQuantityRef.current = currentQuantity;
  }, [cartList, setIsCartOpen]);

  //Cierra el carrito al hacer click en cualquier lugar de la pantalla que no
  //sea el carrito en sí ni el botón "Añadir al Carrito" (ese lo mantiene
  //abierto vía el useEffect de arriba). Se ignora mientras haya CUALQUIER
  //modal abierto (Pagar, Limpiar carrito, Eliminar producto, etc.): todos
  //se renderizan en un portal fuera del div del carrito, y react-modal
  //marca esto agregando la clase "ReactModal__Body--open" al <body>
  //mientras haya al menos un modal abierto, sin importar cuál.
  useEffect(() => {
    if (!isCartOpen) return;

    const handleClickOutside = (event) => {
      if (document.body.classList.contains("ReactModal__Body--open")) return;
      if (cartRef.current && cartRef.current.contains(event.target)) return;
      // No cerrar si el click fue en una tarjeta de producto (agregar al
      // carrito, sumar/restar cantidad, etc.) ni en el ícono que abre/cierra
      // el carrito: ninguno de los dos cuenta como "afuera".
      if (event.target.closest("[data-product-card]")) return;
      if (event.target.closest("[data-cart-toggle]")) return;
      // Ni el cartel de "algo salió mal" (ni su botón de cerrar): cerrar
      // ese aviso no debería cerrar también el carrito que se abrió junto
      // con él.
      if (event.target.closest("[data-payment-banner]")) return;

      setIsCartOpen(false);
    };

    // Se escucha en fase de CAPTURA (el 3er argumento "true"), o sea antes
    // de que React llegue a procesar el click. Si escucháramos en fase de
    // bubbling normal, para cuando nos toca mirar el estado (ej: si hay un
    // modal abierto) React ya pudo haber cerrado ese modal y actualizado el
    // carrito como reacción al mismo click (ej: confirmar "Eliminar
    // producto"), dando un resultado desactualizado.
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;
  return (
    <div className={style.mainContainer} ref={cartRef}>
      <div className={style.header}>
        <div>
          <h3 className={style.title}>Tu pedido</h3>
          <span className={style.count}>
            {cartList.length} producto{cartList.length === 1 ? "" : "s"}
          </span>
        </div>
        <button
          onClick={() => setIsCartOpen(false)}
          onTouchStart={() => setIsCartOpen(false)}
          className={style.closeBtn}
          aria-label="Cerrar carrito"
        >
          ✕
        </button>
      </div>

      {cartList.length === 0 ? (
        <div className={style.emptyState}>
          <div className={style.emptyIcon}>🛒</div>
          <h4>Tu carrito está vacío</h4>
          <p>Todavía no agregaste nada. ¡Mirá lo que tenemos para vos!</p>
          <Link
            to="/products"
            className={style.emptyCta}
            onClick={() => setIsCartOpen(false)}
          >
            Ver productos →
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
              <button onClick={repetirPedido} className={style.lastOrderBtn}>
                Repetir pedido
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={style.items}>
            {cartList.map((product, index) => (
              <ProductCart product={product} key={index} />
            ))}
          </div>

          <div className={style.summary}>
            {/* TODO: reemplazar FREE_SHIPPING_THRESHOLD por el monto real */}
            <div className={style.shipping}>
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <span className={style.shippingUnlocked}>
                  🎉 ¡Envío gratis desbloqueado!
                </span>
              ) : (
                <span className={style.shippingMsg}>
                  Te faltan $
                  {(FREE_SHIPPING_THRESHOLD - totalPriceAnimado).toLocaleString("es-AR")}{" "}
                  para envío gratis
                </span>
              )}
              <div className={style.shippingTrack}>
                <div
                  className={style.shippingFill}
                  style={{
                    width: `${Math.min(
                      (totalPriceAnimado / FREE_SHIPPING_THRESHOLD) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className={style.totalRow}>
              <span>Total</span>
              <span className={style.totalAmount}>${totalPriceAnimado.toLocaleString("es-AR")}</span>
            </div>

            <div className={style.actions}>
              <button
                onClick={() => setModalPaymentOpen(true)}
                className={style.payBtn}
              >
                Pagar
              </button>

              <button
                onClick={compartirPorWhatsApp}
                className={style.whatsappBtn}
              >
                💬 Coordinar por WhatsApp
              </button>

              <button
                onClick={() => setModalEmptyOpen(true)}
                className={style.clearBtn}
              >
                Vaciar carrito
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

      <PaymentModal
        isOpen={isModalPaymentOpen}
        onClose={() => setModalPaymentOpen(false)}
        cartList={cartList}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default Cart;
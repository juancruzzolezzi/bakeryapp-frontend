import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useCartHandlers } from "../../handlers/cartHandlers";
import PaymentModal from "../../components/Modals/PaymentModal";
import EmptyCartModal from "../../components/Modals/EmptyCartModal";
import ProductCart from "../../components/ProductCart/ProductCart";
import style from "./Cart.module.css";

function Cart({ isCartOpen, setIsCartOpen }) {
  
  const cartList = useSelector((state) => state.homeSlice.cartList);

  //Estados locales
  const [totalPrice, setTotalPrice] = useState(0);
  const [isModalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);
  const [setInstagramUsername] = useState("");
  const [setTouched] = useState(false);
  const [setError] = useState("");

  // Destructuring de funciones dentro de useCartHandlers
  const { handleModalYes, handleModalCancel } = useCartHandlers(
    setInstagramUsername,
    setTouched,
    setError,
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
    if (cartList.length > 0) {
      setIsCartOpen(true);
    }
  }, [cartList, setIsCartOpen]);

  if (!isCartOpen) return null;
  return (
    <div className={style.mainContainer}>
      <div className={style.buttonConteiner}>
        <button
          onClick={() => setIsCartOpen(false)}
          onTouchStart={() => setIsCartOpen(false)}
          className={style.closeCart}
        >
          x
        </button>
      </div>

      <h1 className={style.miOrden}>Mi orden</h1>
      <div className={style.productList}>
        {cartList.map((product, index) => (
          <ProductCart product={product} key={index} />
        ))}
      </div>

      <p className={style.totalPrice}>Total: ${totalPrice}</p>

      <div className={style.cartButtons}>
        <button
          onClick={() => setModalPaymentOpen(true)}
          disabled={cartList.length === 0}
          className={style.payNowBtn}
        >
          Pagar
        </button>

        <button
          onClick={() => setModalEmptyOpen(true)}
          disabled={cartList.length === 0}
          className={style.emptyCartBtn}
        >
          Limpiar carrito
        </button>
      </div>

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
        setModalOpen={setModalPaymentOpen}
        setInstagramUsername={setInstagramUsername}
        setTouched={setTouched}
        setError={setError}
        setIsLoading={true}
        setReloadComponent={true}
        setModalEmptyOpen={setModalEmptyOpen}
      />
    </div>
  );
};

export default Cart;
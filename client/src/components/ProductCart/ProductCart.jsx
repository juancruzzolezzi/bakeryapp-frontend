import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProductHandlers } from "../../handlers/productHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import DeleteProductModal from '../Modals/DeleteProductModal';
import style from "./ProductCart.module.css";

const ProductCart = ({ product }) => {
  //"cartList.find(...).quantity" en vez de traer el array cartList entero
  //con useSelector: al devolver un número (no el array), useSelector
  //puede frenar el re-render solo con que ese número no haya cambiado,
  //aunque cartList sí haya cambiado de referencia por otra fila del
  //carrito (agregar/sacar/cambiar cantidad de OTRO producto).
  const quantity = useSelector((state) => {
    const item = state.homeSlice.cartList.find((p) => p.id === product.id);
    return item ? item.quantity : 0;
  });
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);

  const amountAnimado = useAnimatedNumber(product.price * quantity);

  //Destello breve en la fila cada vez que suma cantidad (se agregó desde
  //la tarjeta de producto, o con el "+" de acá mismo), además del pulso
  //que ya tiene el botón "Añadir" en Product.jsx.
  const [flashing, setFlashing] = useState(false);
  const prevQuantityRef = useRef(quantity);

  useEffect(() => {
    if (quantity > prevQuantityRef.current) {
      setFlashing(true);
      const timeout = setTimeout(() => setFlashing(false), 900);
      prevQuantityRef.current = quantity;
      return () => clearTimeout(timeout);
    }
    prevQuantityRef.current = quantity;
  }, [quantity]);

  const {
    handleIncrementCart,
    handleDecrementCart,
    handleModalCancel,
    handleDelete,
  } = useProductHandlers(setModalEmptyOpen);

  //Anima la salida (fade + colapso) antes de borrar de verdad el producto
  //del carrito, en vez de que la fila desaparezca de golpe al confirmar.
  const [removiendo, setRemoviendo] = useState(false);

  const confirmarEliminar = () => {
    setModalEmptyOpen(false);
    setRemoviendo(true);
    setTimeout(() => handleDelete(product.id), 300);
  };

  const handleIncrement = () => {
    handleIncrementCart(product, quantity + 1);
  };

  //Restar respeta la cantidad mínima de 1 (pedir confirmación en vez de
  //restar a 0); "Quitar" de al lado siempre pide confirmar el borrado.
  const handleDecrement = () => {
    if (quantity > 1) {
      handleDecrementCart(product, quantity - 1);
    } else {
      setModalEmptyOpen(true);
    }
  };

  return (
    <div
      className={`${style.row} ${flashing ? style.rowFlash : ""} ${
        removiendo ? style.rowRemoving : ""
      }`}
    >
      <div className={style.thumb}>
        {product.images && product.images.length > 0 && (
          <img src={product.images[0]} alt={product.title} />
        )}
      </div>

      <div className={style.info}>
        <p className={style.name}>{product.title}</p>

        <div className={style.stepper}>
          <button onClick={handleDecrement} aria-label="Restar cantidad">
            –
          </button>
          <span className={style.qty}>{quantity}</span>
          <button onClick={handleIncrement} aria-label="Sumar cantidad">
            +
          </button>
        </div>
      </div>

      <div className={style.priceCol}>
        <span className={style.amount}>${amountAnimado.toLocaleString("es-AR")}</span>
        <button
          onClick={() => setModalEmptyOpen(true)}
          className={style.removeBtn}
        >
          Quitar
        </button>
      </div>

      <DeleteProductModal
        isOpen={isModalEmptyOpen}
        onCancel={handleModalCancel}
        onConfirm={confirmarEliminar}
      />
    </div>
  );
};

//React.memo: ahora que la suscripción de arriba está acotada a la
//cantidad de ESTE producto (no todo cartList), esto evita además que
//cambios ajenos a esta fila (ej: Cart.jsx re-renderizando por el
//descuento o el total) la vuelvan a renderizar sin necesidad.
export default React.memo(ProductCart);

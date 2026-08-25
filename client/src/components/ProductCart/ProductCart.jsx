import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useProductHandlers } from "../../handlers/productHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import DeleteProductModal from '../Modals/DeleteProductModal';
import style from "./ProductCart.module.css";

const ProductCart = ({ product }) => {
  const cart = useSelector((state) => state.homeSlice.cartList);
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);

  const currentProduct = cart.find((item) => item.id === product.id);
  const quantity = currentProduct ? currentProduct.quantity : 0;
  const amountAnimado = useAnimatedNumber(product.price * quantity);

  const {
    handleIncrementCart,
    handleDecrementCart,
    handleModalCancel,
    handleDelete,
  } = useProductHandlers(setModalEmptyOpen);

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
    <div className={style.row}>
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
        onConfirm={() => handleDelete(product.id)}
      />
    </div>
  );
};

export default ProductCart;

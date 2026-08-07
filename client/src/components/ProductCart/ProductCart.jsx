import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useProductHandlers } from "../../handlers/productHandlers";
import DeleteProductModal from '../Modals/DeleteProductModal';
import style from "./ProductCart.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

const ProductCart = ({ product }) => {
  const cart = useSelector((state) => state.homeSlice.cartList);
  const [isModalEmptyOpen, setModalEmptyOpen] = useState(false);

  const currentProduct = cart.find((item) => item.id === product.id);
  const quantity = currentProduct ? currentProduct.quantity : 0;

  const {
    handleIncrementCart,
    handleDecrementCart,
    handleModalCancel,
    handleDelete,
  } = useProductHandlers(setModalEmptyOpen);

    const handleIncrement = () => {
      const newQuantity = quantity + 1;
      handleIncrementCart(product, newQuantity);
    };

    const handleDecrement = () => {
      if (quantity > 1) {
        const newQuantity = quantity - 1;
        handleDecrementCart(product, newQuantity);
      } else {
        setModalEmptyOpen(true);
      }
    };


  return (
    <div className={style.main}>
      <div className={style.imgConteiner}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt="imagen" className={style.imagen} />
        ) : (
          ""
        )}
      </div>

      <div className={style.description}>
        <span className={style.quantity}>{quantity}</span>

        <div className={style.buttonsConteiner}>
          {product.quantity > 1 ? (
            <button
              onClick={handleDecrement}
              className={style.quantityButton}
            >
              {" "}
              -{" "}
            </button>
          ) : (
            <button
              onClick={() => setModalEmptyOpen(true)}
              className={style.deleteButton}
            >
              <FontAwesomeIcon icon={faTrashCan} className={style.trash} />
            </button>
          )}

          <DeleteProductModal
            isOpen={isModalEmptyOpen}
            onCancel={handleModalCancel}
            onConfirm={() => handleDelete(product.id)}
          />

          <button
            onClick={handleIncrement}
            className={style.quantityButton}
          >
            {" "}
            +{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
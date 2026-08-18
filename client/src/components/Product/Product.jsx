import React, { useState } from "react";
import { useProductHandlers } from "../../handlers/productHandlers";
import style from "./Product.module.css";

const Product = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = product.price * quantity;
  const { handleAddToCart } = useProductHandlers();

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    handleAddToCart(product, quantity);
    setQuantity(1); // Resetea la cantidad a 1 después de agregar
  };

  return (
    <div
      className={style.productContainer}
      data-category={product.category}
      data-product-card="true"
    >
      <div className={style.photo}>
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.title}
            className={style.image}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className={style.pricePill}>${totalPrice}</span>
      </div>

      <div className={style.body}>
        <p className={style.name}>{product.title}</p>
        <p className={style.desc}>{product.description}</p>

        <div className={style.footerRow}>
          <div className={style.stepper}>
            <button onClick={decrementQuantity} aria-label="Restar cantidad">
              –
            </button>
            <span className={style.qty}>{quantity}</span>
            <button onClick={incrementQuantity} aria-label="Sumar cantidad">
              +
            </button>
          </div>

          <button
            onClick={addToCart}
            className={style.addToCartButton}
            data-add-to-cart="true"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;

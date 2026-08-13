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
      <div className={style.imageConteiner}>
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.title}
            className={style.image}
          />
        )}
      </div>

      <div className={style.dataConteiner}>
        <div className={style.descriptionContainer}>
          <p className={style.productDescription}>{product.description}</p>
        </div>

        <div className={style.secondaryContainer}>
          <div className={style.quantityContainer}>
            <button
              onClick={decrementQuantity}
              className={style.quantityButton}
            >
              {" "}
              -{" "}
            </button>

            <span className={style.quantity}>{quantity}</span>

            <button
              onClick={incrementQuantity}
              className={style.quantityButton}
            >
              {" "}
              +{" "}
            </button>
          </div>

          <button
            onClick={addToCart}
            className={style.addToCartButton}
            data-add-to-cart="true"
          >
            Añadir al Carrito ${totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;

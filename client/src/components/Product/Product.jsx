import React, { useRef, useState } from "react";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { flyToCart } from "../../utils/flyToCart";
import style from "./Product.module.css";

//Ajustes puntuales de encuadre para fotos concretas que quedan mal
//centradas con el recorte por defecto (no hay ningún campo para esto en
//la base, así que se resuelve acá con el título como clave).
const AJUSTE_ENCUADRE = {
  "Lágrima": "75% center",
};

const Product = ({ product, featured }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = product.price * quantity;
  const totalPriceAnimado = useAnimatedNumber(totalPrice);
  const totalPriceFormateado = totalPriceAnimado.toLocaleString("es-AR");
  const { handleAddToCart } = useProductHandlers();
  const photoRef = useRef(null);

  //Confirmación local en el botón: dice "✓ Agregado" un instante antes de
  //volver a "Añadir", como refuerzo extra además del vuelo hacia el carrito.
  const [recienAgregado, setRecienAgregado] = useState(false);

  //"stock" todavía no lo devuelve la API (ver api/db/products.routes.js);
  //queda listo para cuando lo agreguen, sin inventar disponibilidad
  //mientras tanto (product.stock === undefined nunca marca "agotado").
  const agotado = product.stock === 0;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const addToCart = () => {
    flyToCart(photoRef.current, product.images?.[0]);
    handleAddToCart(product, quantity);
    setQuantity(1); // Resetea la cantidad a 1 después de agregar
    setRecienAgregado(true);
    setTimeout(() => setRecienAgregado(false), 1200);
  };

  return (
    <div
      className={`${style.productContainer} ${featured ? style.featured : ""} ${
        agotado ? style.agotado : ""
      }`}
      data-category={product.category}
      data-product-card="true"
    >
      <div className={style.photo} ref={photoRef}>
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.title}
            className={style.image}
            style={
              AJUSTE_ENCUADRE[product.title]
                ? { objectPosition: AJUSTE_ENCUADRE[product.title] }
                : undefined
            }
            loading="lazy"
            decoding="async"
          />
        )}
        {featured && <span className={style.featuredTag}>Recomendado</span>}
        {agotado && <span className={style.agotadoTag}>Agotado</span>}
        <span className={style.pricePill}>${totalPriceFormateado}</span>
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
            className={`${style.addToCartButton} ${recienAgregado ? style.recienAgregado : ""}`}
            data-add-to-cart="true"
            disabled={agotado}
          >
            {agotado ? "Agotado" : recienAgregado ? "✓ Agregado" : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;

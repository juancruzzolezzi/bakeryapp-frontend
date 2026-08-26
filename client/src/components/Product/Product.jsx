import React, { useEffect, useRef, useState } from "react";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import { useFavorites } from "../../hooks/useFavorites";
import { flyToCart } from "../../utils/flyToCart";
import style from "./Product.module.css";

//Ajustes puntuales de encuadre para fotos concretas que quedan mal
//centradas con el recorte por defecto (no hay ningún campo para esto en
//la base, así que se resuelve acá con el título como clave).
const AJUSTE_ENCUADRE = {
  "Lágrima": "100% center",
  "Café Americano": "70% center",
  "Café de Especialidad": "70% center",
  "Milkshake de Frutilla": "center 30%",
  "Cheesecake de Maracuyá": "30% center",
  "Medialuna con Jamón y Queso": "30% center",
};

//Productos cuya foto se muestra completa (sin recortar con "cover"), por
//si algún encuadre queda mal con el zoom por defecto.
const AJUSTE_SIN_ZOOM = new Set([]);

const Product = ({ product, featured }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = product.price * quantity;
  const totalPriceAnimado = useAnimatedNumber(totalPrice);
  const totalPriceFormateado = totalPriceAnimado.toLocaleString("es-AR");
  const { handleAddToCart } = useProductHandlers();
  const { isFavorite, toggleFavorite } = useFavorites();
  const esFavorito = isFavorite(product.id);
  const photoRef = useRef(null);

  //Confirmación local en el botón: dice "✓ Agregado" un instante antes de
  //volver a "Añadir", como refuerzo extra además del vuelo hacia el carrito.
  const [recienAgregado, setRecienAgregado] = useState(false);

  //Confirmación local de "Compartir": muestra "¡Copiado!" un instante en
  //vez del ícono, igual que "recienAgregado" arriba.
  const [linkCopiado, setLinkCopiado] = useState(false);

  //"stock" todavía no lo devuelve la API (ver api/db/products.routes.js);
  //queda listo para cuando lo agreguen, sin inventar disponibilidad
  //mientras tanto (product.stock === undefined nunca marca "agotado").
  const agotado = product.stock === 0;

  //Skeleton gris pulsante mientras carga la foto (conexión lenta, primera
  //visita sin caché), en vez del hueco vacío que quedaba hasta que
  //apareciera. imgRef.complete cubre el caso de que ya esté cacheada y
  //"onLoad" no llegue a dispararse después de montar el listener.
  const [imgCargada, setImgCargada] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setImgCargada(true);
  }, []);

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

  //Comparte un link directo a este producto (con ?producto=<id>, ver el
  //scroll-to en Products.jsx): usa el share nativo del celular si está
  //disponible, y si no copia el link al portapapeles.
  const shareUrl = `${window.location.origin}/products?producto=${product.id}`;

  const shareProduct = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url: shareUrl });
      } catch {
        // El usuario canceló el share nativo: no hace falta avisar nada.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 1500);
    } catch {
      // Portapapeles no disponible (ej: sitio sin HTTPS): no hay fallback.
    }
  };

  return (
    <div
      id={`producto-${product.id}`}
      className={`${style.productContainer} ${featured ? style.featured : ""} ${
        agotado ? style.agotado : ""
      }`}
      data-category={product.category}
      data-product-card="true"
    >
      <div className={style.photo} ref={photoRef}>
        {product.images && product.images.length > 0 && (
          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.title}
            className={`${style.image} ${imgCargada ? style.imageCargada : ""}`}
            style={{
              ...(AJUSTE_ENCUADRE[product.title] && {
                objectPosition: AJUSTE_ENCUADRE[product.title],
              }),
              ...(AJUSTE_SIN_ZOOM.has(product.title) && {
                objectFit: "contain",
                backgroundColor: "#2f2318",
              }),
            }}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgCargada(true)}
          />
        )}
        {!imgCargada && <div className={style.photoSkeleton} aria-hidden="true" />}
        {featured && <span className={style.featuredTag}>Recomendado</span>}
        {agotado && <span className={style.agotadoTag}>Agotado</span>}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`${style.favoriteBtn} ${esFavorito ? style.favoriteBtnActive : ""}`}
          aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={esFavorito}
        >
          {esFavorito ? "♥" : "♡"}
        </button>
        <span className={style.pricePill}>${totalPriceFormateado}</span>
      </div>

      <div className={style.body}>
        <div className={style.nameRow}>
          <p className={style.name}>{product.title}</p>
          <button
            type="button"
            onClick={shareProduct}
            className={style.shareBtn}
            aria-label="Compartir producto"
          >
            {linkCopiado ? "✓" : "🔗"}
          </button>
        </div>
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

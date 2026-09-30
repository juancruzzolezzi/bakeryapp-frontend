import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useIsFavorite } from "../../hooks/useFavorites";
import { useToast } from "../../context/ToastContext";
import { flyToCart } from "../../utils/flyToCart";
import { getVentaInfo } from "../../utils/ventaTag";
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

const HeartIcon = ({ lleno }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={lleno ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const Product = ({ product }) => {
  const { handleAddToCart } = useProductHandlers();
  const [esFavorito, toggleFavorite] = useIsFavorite(product.id);
  const showToast = useToast();
  const navigate = useNavigate();
  const photoRef = useRef(null);

  //Cuántas unidades de ESTE producto hay en el pedido. El selector
  //devuelve un número: la tarjeta solo se vuelve a renderizar cuando
  //cambia su propia cantidad, no cuando cambia cualquier otro producto.
  const enPedido = useSelector(
    (state) => state.homeSlice.cartList.find((p) => p.id === product.id)?.quantity || 0
  );

  const { tag: ventaTag, descripcionLimpia } = getVentaInfo(product.description);

  //"stock" todavía no lo devuelve la API; queda listo para cuando lo
  //agreguen (product.stock === undefined nunca marca "agotado").
  const agotado = product.stock === 0;

  //Skeleton mientras carga la foto; "complete" cubre la foto ya cacheada.
  const [imgCargada, setImgCargada] = useState(false);
  const imgRef = useRef(null);
  useEffect(() => {
    if (imgRef.current?.complete) setImgCargada(true);
  }, []);

  //Cualquier parte "vacía" de la tarjeta lleva al detalle; los botones y
  //links propios manejan su propio click.
  const goToDetail = (e) => {
    if (e.target.closest("button, a")) return;
    navigate(`/products/${product.id}`);
  };

  const agregar = () => {
    flyToCart(photoRef.current, product.images?.[0]);
    handleAddToCart(product, 1);
    showToast("Agregado a tu pedido", "🛒");
  };

  const handleToggleFavorite = () => {
    toggleFavorite();
    showToast(
      esFavorito ? "Quitado de favoritos" : "Guardado en favoritos",
      esFavorito ? "♡" : "♥"
    );
  };

  return (
    <article
      className={`${style.card} ${agotado ? style.agotado : ""}`}
      onClick={goToDetail}
      data-product-card="true"
    >
      <div className={style.photo} ref={photoRef}>
        <Link
          to={`/products/${product.id}`}
          className={style.photoLink}
          aria-label={`Ver ${product.title}`}
        />
        {product.images?.[0] && (
          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.title}
            className={`${style.image} ${imgCargada ? style.imageCargada : ""}`}
            style={
              AJUSTE_ENCUADRE[product.title]
                ? { objectPosition: AJUSTE_ENCUADRE[product.title] }
                : undefined
            }
            loading="lazy"
            decoding="async"
            onLoad={() => setImgCargada(true)}
          />
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`${style.favBtn} ${esFavorito ? style.favBtnOn : ""}`}
          aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={esFavorito}
        >
          <HeartIcon lleno={esFavorito} />
        </button>
        {ventaTag && <span className={style.unitTag}>{ventaTag}</span>}
        {agotado && <span className={style.agotadoTag}>Agotado</span>}
      </div>

      <div className={style.body}>
        <Link to={`/products/${product.id}`} className={style.name}>
          {product.title}
        </Link>
        <p className={style.desc}>{descripcionLimpia}</p>

        <div className={style.foot}>
          <span className={style.price}>${product.price.toLocaleString("es-AR")}</span>
          <button
            type="button"
            onClick={agregar}
            className={`${style.addBtn} ${enPedido > 0 ? style.addBtnIn : ""}`}
            data-add-to-cart="true"
            disabled={agotado}
            aria-label={
              enPedido > 0
                ? `Agregar otro ${product.title} (llevás ${enPedido})`
                : `Agregar ${product.title}`
            }
          >
            {agotado ? (
              "Agotado"
            ) : enPedido > 0 ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                {enPedido} en tu pedido
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

//React.memo: cada tecla en el buscador o cambio de filtro no vuelve a
//renderizar las tarjetas que no cambiaron (el objeto "product" viene del
//cache de RTK Query y mantiene su referencia).
export default React.memo(Product);

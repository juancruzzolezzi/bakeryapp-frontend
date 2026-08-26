import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
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

//Productos cuya foto se muestra completa (sin recortar con "cover"), por
//si algún encuadre queda mal con el zoom por defecto.
const AJUSTE_SIN_ZOOM = new Set([]);

//Se consulta una sola vez (no en cada mousemove, ver handleTilt): crear un
//MediaQueryList por evento era puro desperdicio con el mouse en movimiento.
const prefiereMenosMovimiento = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Product = ({ product, featured }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = product.price * quantity;
  const totalPriceAnimado = useAnimatedNumber(totalPrice);
  const totalPriceFormateado = totalPriceAnimado.toLocaleString("es-AR");
  const { handleAddToCart } = useProductHandlers();
  const [esFavorito, toggleFavorite] = useIsFavorite(product.id);
  const showToast = useToast();
  const photoRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  //Cualquier parte "vacía" de la tarjeta (no solo la foto o el nombre)
  //lleva al detalle del producto. Los botones y links propios (favorito,
  //compartir, stepper, añadir, la foto) manejan su propio click y no
  //deben disparar también esta navegación: closest("button, a") los
  //excluye porque son justo esos los elementos interactivos de la tarjeta.
  const goToDetail = (e) => {
    if (e.target.closest("button, a")) return;
    navigate(`/products/${product.id}`);
  };

  //Tilt 3D sutil que sigue al mouse (solo desktop, con mouse real): se
  //combina con el lift que ya tiene la tarjeta al hover (ver
  //Product.module.css) en el mismo transform inline, para no perder ese
  //efecto al pisarlo con JS.
  //
  //El "mousemove" dispara hasta ~120 veces por segundo: antes, cada uno
  //hacía un getBoundingClientRect() (fuerza un reflow) y escribía el
  //transform al toque, sin límite. Con muchas tarjetas en la grilla (ver
  //Products.jsx) eso es lo que se sentía "trabado" al mover el mouse. Acá
  //el rect se mide una sola vez al entrar (no en cada movimiento) y la
  //escritura del transform se agrupa con requestAnimationFrame, como mucho
  //una vez por frame en vez de una vez por evento.
  const rectRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  const aplicarTilt = () => {
    rafRef.current = null;
    const card = cardRef.current;
    const rect = rectRef.current;
    if (!card || !rect) return;
    const x = (pointerRef.current.x - rect.left) / rect.width - 0.5;
    const y = (pointerRef.current.y - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) scale(1.015) perspective(800px) rotateY(${
      x * 6
    }deg) rotateX(${-y * 6}deg)`;
  };

  const handleTiltEnter = () => {
    if (prefiereMenosMovimiento() || !cardRef.current) return;
    //Le avisa al navegador que promueva la tarjeta a su propia capa recién
    //ahora (no siempre, en las ~30 tarjetas de la grilla a la vez: eso
    //gastaría memoria de más sin necesidad). Se saca en resetTilt. Esto NO
    //fuerza layout (a diferencia de getBoundingClientRect, ver handleTilt).
    cardRef.current.style.willChange = "transform";
  };

  const handleTilt = (e) => {
    if (prefiereMenosMovimiento() || !cardRef.current) return;
    //El rect recién se mide acá (en el primer mousemove real de este
    //paso por la tarjeta), no en "onMouseEnter": al bajar rápido con el
    //mouse quieto, las tarjetas pasan por debajo del cursor y disparan
    //mouseenter/mouseleave en cadena sin que el mouse se mueva de
    //verdad — si el rect se midiera ahí, cada una forzaría un reflow
    //sincrónico en medio del scroll rápido, y eso era lo que se sentía
    //trabado al bajar rápido por la grilla. "mousemove" en cambio solo
    //dispara con movimiento real del cursor, así que un scroll con el
    //mouse quieto no cuesta nada acá.
    if (!rectRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(aplicarTilt);
    }
  };

  const resetTilt = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    rectRef.current = null;
    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.willChange = "";
    }
  };

  const { tag: ventaTag, descripcionLimpia } = getVentaInfo(product.description);

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
    showToast("Agregado al carrito", "🛒");
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite();
    showToast(
      esFavorito ? "Quitado de favoritos" : "Guardado en favoritos",
      esFavorito ? "♡" : "♥"
    );
  };

  //Comparte un link directo a la página de detalle de este producto: usa
  //el share nativo del celular si está disponible, y si no copia el link
  //al portapapeles.
  const shareUrl = `${window.location.origin}/products/${product.id}`;

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
      showToast("Link copiado", "🔗");
    } catch {
      // Portapapeles no disponible (ej: sitio sin HTTPS): no hay fallback.
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleTiltEnter}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
      onClick={goToDetail}
      className={`${style.productContainer} ${featured ? style.featured : ""} ${
        agotado ? style.agotado : ""
      }`}
      data-category={product.category}
      data-product-card="true"
    >
      <div className={style.photo} ref={photoRef}>
        <Link
          to={`/products/${product.id}`}
          className={style.photoLink}
          aria-label={`Ver ${product.title}`}
        />
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
            /* Las "featured" (Recomendado) siempre están visibles apenas
               carga la página, arriba de todo: con "lazy" el navegador las
               posterga igual que a las de más abajo en la grilla, cuando
               en realidad convendría bajarlas ya mismo y con prioridad. */
            loading={featured ? "eager" : "lazy"}
            fetchpriority={featured ? "high" : "auto"}
            decoding="async"
            onLoad={() => setImgCargada(true)}
          />
        )}
        {featured && <span className={style.featuredTag}>Recomendado</span>}
        {agotado && <span className={style.agotadoTag}>Agotado</span>}
        {ventaTag && <span className={style.ventaTag}>{ventaTag}</span>}
        <button
          type="button"
          onClick={handleToggleFavorite}
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
          <Link to={`/products/${product.id}`} className={style.name}>
            {product.title}
          </Link>
          <button
            type="button"
            onClick={shareProduct}
            className={style.shareBtn}
            aria-label="Compartir producto"
          >
            {linkCopiado ? "✓" : "🔗"}
          </button>
        </div>
        <p className={style.desc}>{descripcionLimpia}</p>

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

//React.memo: sin esto, cada tecla en el buscador o cambio de filtro (ver
//Products.jsx) volvía a renderizar TODAS las tarjetas de la grilla, no
//solo las que cambiaron. Los productos vienen del cache de RTK Query, así
//que el objeto "product" de uno que sigue en la lista mantiene la misma
//referencia entre renders — memo puede saltearlo de verdad, no es un
//memo de fachada.
export default React.memo(Product);

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/Navs/NavBar/NavBar";
import BackToTop from "../../components/BackToTop/BackToTop";
import Footer from "../../components/Footer/Footer";
import Product from "../../components/Product/Product";
import { useGetProductsQuery } from "../../api/appApi";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useIsFavorite } from "../../hooks/useFavorites";
import { useToast } from "../../context/ToastContext";
import { getVentaInfo } from "../../utils/ventaTag";
import { CONTACTO } from "../../constants/contacto";
import { FREE_SHIPPING_THRESHOLD } from "../../constants/deliveryZones";
import styles from "./ProductDetail.module.css";

const formatearPrecio = (monto) => `$${monto.toLocaleString("es-AR")}`;

//Texto de alérgenos según la categoría (no hay un campo por producto en la
//base). Mismo criterio que la FAQ: todo se elabora en la misma cocina.
//TODO: reemplazar por el detalle real de cada producto cuando exista.
const alergenosPara = (categoria) => {
  if (categoria === "Infusiones") return null;
  if (categoria === "Sin TACC") {
    return "Elaborado sin harinas con gluten, en la misma cocina donde se usa harina de trigo: puede contener trazas.";
  }
  if (categoria === "Vegano") {
    return "Sin huevo ni lácteos. Puede contener trazas de frutos secos y gluten.";
  }
  return "Contiene gluten, huevo y lácteos. Puede contener trazas de frutos secos.";
};

//"Ideal con": a lo dulce le sugerimos un café, y a un café algo dulce.
const elegirAcompaniante = (product, products) => {
  if (product.category !== "Infusiones") {
    return (
      products.find((p) => p.title === "Café de Especialidad") ||
      products.find((p) => p.category === "Infusiones")
    );
  }
  return (
    products.find((p) => p.title === "Medialunas de Manteca") ||
    products.find((p) => p.category === "Facturas")
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const { handleAddToCart } = useProductHandlers();
  //Se usa el "id" de la URL (mismo string que product.id) en vez de
  //esperar a "product": los hooks no pueden llamarse condicionalmente.
  const [esFavorito, toggleFavorite] = useIsFavorite(id);
  const showToast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [imgCargada, setImgCargada] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  //Vuelve a la página anterior (conserva filtros y scroll del listado).
  //Si se entró directo por link, no hay historial propio: va a productos.
  const volver = () => {
    if (location.key === "default") navigate("/products");
    else navigate(-1);
  };

  //Al pasar de un producto a otro (desde "También te puede gustar"), la
  //cantidad y la foto arrancan de cero.
  useEffect(() => {
    setQuantity(1);
    setImgCargada(false);
  }, [id]);

  const product = products?.find((p) => String(p.id) === id);
  const { tag: ventaTag, descripcionLimpia } = getVentaInfo(product?.description);
  const agotado = product?.stock === 0;

  //"Más vendido": entre los 3 con más ventas registradas (si hay alguna).
  const masVendido = useMemo(() => {
    if (!products || !product || !product.sold) return false;
    const top = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
    return top.some((p) => p.id === product.id);
  }, [products, product]);

  const acompaniante = useMemo(
    () => (product && products ? elegirAcompaniante(product, products) : null),
    [product, products]
  );

  //Misma categoría primero; si no alcanzan 4, se completa con los más
  //vendidos del resto.
  const relacionados = useMemo(() => {
    if (!product || !products) return [];
    const otros = products.filter((p) => p.id !== product.id);
    const misma = otros.filter((p) => p.category === product.category);
    const resto = otros
      .filter((p) => p.category !== product.category)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0));
    return [...misma, ...resto].slice(0, 4);
  }, [product, products]);

  const addToCart = () => {
    handleAddToCart(product, quantity);
    setQuantity(1);
    showToast("Agregado a tu pedido", "🛒");
  };

  const agregarLosDos = () => {
    handleAddToCart(product, 1);
    handleAddToCart(acompaniante, 1);
    showToast("Agregamos los dos a tu pedido", "🛒");
  };

  const handleToggleFavorite = () => {
    toggleFavorite();
    showToast(
      esFavorito ? "Quitado de favoritos" : "Guardado en favoritos",
      esFavorito ? "♡" : "♥"
    );
  };

  const shareProduct = async () => {
    const shareUrl = window.location.href;
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
      showToast("Link copiado", "🔗");
    } catch {
      // Portapapeles no disponible (ej: sitio sin HTTPS): no hay fallback.
    }
  };

  const alergenos = product ? alergenosPara(product.category) : null;

  return (
    <div className={`catalogoClaro ${styles.container}`}>
      <NavBar claro />
      <div className={styles.topBand} aria-hidden="true" />

      <div className={styles.page}>
        {isLoading && <p className={styles.stateMessage}>Cargando...</p>}

        {!isLoading && (isError || !product) && (
          <div className={styles.notFound}>
            <p className={styles.stateMessage}>No encontramos este producto.</p>
            <Link to="/products" className={styles.backLink}>
              ← Volver a productos
            </Link>
          </div>
        )}

        {!isLoading && product && (
          <>
            <button type="button" onClick={volver} className={styles.backBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Volver
            </button>

            <nav className={styles.breadcrumb} aria-label="Ubicación">
              <Link to="/products">Productos</Link>
              <span aria-hidden="true">/</span>
              <Link to="/products" state={{ categoria: product.category }}>
                {product.category}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.title}</span>
            </nav>

            <section className={styles.detail}>
              <div className={styles.photo}>
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className={`${styles.image} ${imgCargada ? styles.imageCargada : ""}`}
                    //Es la imagen principal de la página: prioridad alta.
                    fetchpriority="high"
                    decoding="async"
                    onLoad={() => setImgCargada(true)}
                  />
                )}
                {masVendido && <span className={styles.badge}>Más vendido</span>}
                {agotado && <span className={styles.agotadoTag}>Agotado</span>}
              </div>

              <div className={styles.body}>
                <div className={styles.chips}>
                  <span className={styles.chip}>{product.category}</span>
                  {ventaTag && <span className={styles.chip}>{ventaTag}</span>}
                  {product.category !== "Infusiones" && (
                    <span className={styles.chip}>Horneado en el día</span>
                  )}
                </div>

                <h1 className={styles.name}>{product.title}</h1>
                <p className={styles.price}>{formatearPrecio(product.price)}</p>
                <p className={styles.desc}>{descripcionLimpia}</p>

                <div className={styles.actionsRow}>
                  <div className={styles.stepper}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Restar una unidad"
                    >
                      –
                    </button>
                    <span className={styles.qty} aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                      aria-label="Sumar una unidad"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addToCart}
                    className={styles.addBtn}
                    disabled={agotado}
                  >
                    {agotado ? "Agotado" : `Agregar · ${formatearPrecio(product.price * quantity)}`}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`${styles.iconBtn} ${esFavorito ? styles.iconBtnOn : ""}`}
                    aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                    aria-pressed={esFavorito}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={esFavorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  </button>

                  <button
                    type="button"
                    onClick={shareProduct}
                    className={styles.iconBtn}
                    aria-label="Compartir producto"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                  </button>
                </div>

                <dl className={styles.info}>
                  <div className={styles.infoRow}>
                    <dt>Entrega</dt>
                    <dd>
                      Delivery en Belgrano y alrededores o take away en {CONTACTO.direccion}.
                      Envío gratis desde {formatearPrecio(FREE_SHIPPING_THRESHOLD)}.
                    </dd>
                  </div>
                  {alergenos && (
                    <div className={styles.infoRow}>
                      <dt>Alérgenos</dt>
                      <dd>{alergenos}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>

            {acompaniante && (
              <section className={styles.pairing} aria-label="Ideal con">
                {acompaniante.images?.[0] && (
                  <img
                    src={acompaniante.images[0]}
                    alt={acompaniante.title}
                    className={styles.pairingImg}
                    loading="lazy"
                  />
                )}
                <div className={styles.pairingText}>
                  <span className={styles.pairingEyebrow}>Ideal con</span>
                  <Link to={`/products/${acompaniante.id}`} className={styles.pairingName}>
                    {acompaniante.title}
                  </Link>
                  <span className={styles.pairingPrice}>
                    {formatearPrecio(acompaniante.price)}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.pairingBtn}
                  onClick={agregarLosDos}
                  disabled={agotado}
                >
                  Agregar los dos · {formatearPrecio(product.price + acompaniante.price)}
                </button>
              </section>
            )}

            {relacionados.length > 0 && (
              <section className={styles.related} aria-labelledby="relacionados">
                <h2 id="relacionados" className={styles.relatedTitle}>
                  También te puede gustar
                </h2>
                <div className={styles.relatedGrid}>
                  {relacionados.map((p) => (
                    <Product key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <div className={styles.footerBand}>
        <Footer />
      </div>

      <BackToTop />
    </div>
  );
};

export default ProductDetail;

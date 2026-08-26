import React, { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavBar from "../../components/Navs/NavBar/NavBar";
import BackToTop from "../../components/BackToTop/BackToTop";
import { useGetProductsQuery } from "../../api/appApi";
import { useProductHandlers } from "../../handlers/productHandlers";
import { useFavorites } from "../../hooks/useFavorites";
import { useToast } from "../../context/ToastContext";
import { getVentaInfo } from "../../utils/ventaTag";
import styles from "./ProductDetail.module.css";

const ProductDetail = () => {
    const { id } = useParams();
    const { data: products, isLoading, isError } = useGetProductsQuery();
    const { handleAddToCart } = useProductHandlers();
    const { isFavorite, toggleFavorite } = useFavorites();
    const showToast = useToast();
    const [quantity, setQuantity] = useState(1);

    //Mismo "blur-up" que las tarjetas de la grilla (ver Product.jsx).
    const [imgCargada, setImgCargada] = useState(false);

    //Mismo tilt 3D sutil que sigue al mouse que las tarjetas de la grilla
    //(ver Product.jsx, con la misma optimización: el rect se mide una sola
    //vez al entrar, no en cada mousemove, y la escritura del transform se
    //agrupa con requestAnimationFrame en vez de una vez por evento.
    const photoRef = useRef(null);
    const rectRef = useRef(null);
    const rafRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0 });

    const prefiereMenosMovimiento = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const aplicarTilt = () => {
        rafRef.current = null;
        const photo = photoRef.current;
        const rect = rectRef.current;
        if (!photo || !rect) return;
        const x = (pointerRef.current.x - rect.left) / rect.width - 0.5;
        const y = (pointerRef.current.y - rect.top) / rect.height - 0.5;
        photo.style.transform = `scale(1.03) perspective(800px) rotateY(${
            x * 8
        }deg) rotateX(${-y * 8}deg)`;
    };

    const handleTiltEnter = () => {
        if (prefiereMenosMovimiento() || !photoRef.current) return;
        rectRef.current = photoRef.current.getBoundingClientRect();
        photoRef.current.style.willChange = "transform";
    };

    const handleTilt = (e) => {
        if (prefiereMenosMovimiento() || !rectRef.current) return;
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
        if (photoRef.current) {
            photoRef.current.style.transform = "";
            photoRef.current.style.willChange = "";
        }
    };

    const product = products?.find((p) => String(p.id) === id);

    const { tag: ventaTag, descripcionLimpia } = getVentaInfo(product?.description);

    const agotado = product?.stock === 0;
    const esFavorito = product ? isFavorite(product.id) : false;

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const addToCart = () => {
        handleAddToCart(product, quantity);
        setQuantity(1);
        showToast("Agregado al carrito", "🛒");
    };

    const handleToggleFavorite = () => {
        toggleFavorite(product.id);
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

    return (
        <div className={styles.container}>
            <NavBar />

            <div className={styles.sectionContainer}>
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
                    <div className={styles.detail}>
                        <div
                            className={styles.photo}
                            ref={photoRef}
                            onMouseEnter={handleTiltEnter}
                            onMouseMove={handleTilt}
                            onMouseLeave={resetTilt}
                        >
                            {product.images?.[0] && (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className={`${styles.image} ${
                                        imgCargada ? styles.imageCargada : ""
                                    }`}
                                    //Es la imagen principal de la página (siempre
                                    //visible, sin scroll): con prioridad alta el
                                    //navegador la baja antes que el resto.
                                    fetchpriority="high"
                                    decoding="async"
                                    onLoad={() => setImgCargada(true)}
                                />
                            )}
                            {agotado && <span className={styles.agotadoTag}>Agotado</span>}
                            {ventaTag && <span className={styles.ventaTag}>{ventaTag}</span>}
                        </div>

                        <div className={styles.body}>
                            <Link to="/products" className={styles.backLink}>
                                ← Volver a productos
                            </Link>

                            <h1 className={styles.name}>{product.title}</h1>
                            <p className={styles.price}>
                                ${product.price.toLocaleString("es-AR")}
                            </p>
                            <p className={styles.desc}>{descripcionLimpia}</p>

                            <div className={styles.actionsRow}>
                                <div className={styles.stepper}>
                                    <button onClick={decrementQuantity} aria-label="Restar cantidad">
                                        –
                                    </button>
                                    <span className={styles.qty}>{quantity}</span>
                                    <button onClick={incrementQuantity} aria-label="Sumar cantidad">
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={addToCart}
                                    className={styles.addToCartButton}
                                    disabled={agotado}
                                >
                                    {agotado ? "Agotado" : "Agregar al carrito"}
                                </button>
                            </div>

                            <div className={styles.secondaryRow}>
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className={`${styles.secondaryBtn} ${
                                        esFavorito ? styles.secondaryBtnActive : ""
                                    }`}
                                >
                                    {esFavorito ? "♥ En favoritos" : "♡ Agregar a favoritos"}
                                </button>
                                <button
                                    type="button"
                                    onClick={shareProduct}
                                    className={styles.secondaryBtn}
                                >
                                    🔗 Compartir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BackToTop />
        </div>
    );
};

export default ProductDetail;

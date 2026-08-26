import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
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
            <NavBarHome />

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
                        <div className={styles.photo}>
                            {product.images?.[0] && (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className={`${styles.image} ${
                                        imgCargada ? styles.imageCargada : ""
                                    }`}
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

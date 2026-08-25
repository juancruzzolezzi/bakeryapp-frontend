import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import style from "./Home.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import { emptyCart } from "../../redux/slice/homeSlice";
// import ProductsHome from "../../components/ProductsHome/ProductsHome";

function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  //"success" | "failure" | "pending" | null: qué cartel mostrar al volver
  //de Mercado Pago.
  const [paymentStatus, setPaymentStatus] = useState(null);

  //Si volvemos de Mercado Pago: pago aprobado -> vaciamos el carrito y
  //mostramos el cartel de éxito. Si no se pagó (falló o quedó pendiente),
  //mostramos el cartel de error SIN tocar el carrito, para que el
  //comprador lo encuentre tal cual lo dejó.
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      dispatch(emptyCart());
      setPaymentStatus("success");
      setSearchParams({}, { replace: true });
    } else if (payment === "failure" || payment === "pending") {
      setPaymentStatus(payment);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, dispatch, setSearchParams]);

  //Parallax de la portada: la foto se desplaza levemente en sentido
  //contrario al mouse, dando sensación de profundidad. Con un pequeño
  //factor (12px máx) para que sea un detalle sutil, no un efecto mareador.
  const heroPhotoRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroPhotoRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    heroPhotoRef.current.style.transform = `translate(${x * -12}px, ${y * -12}px)`;
  };

  const handleMouseLeave = () => {
    if (!heroPhotoRef.current) return;
    heroPhotoRef.current.style.transform = "translate(0, 0)";
  };

  return (
    <div
      className={style.mainContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={style.heroPhoto} ref={heroPhotoRef} />
      <NavBarHome />

      {paymentStatus && (
        <div
          className={style.paymentOverlay}
          data-payment-banner="true"
          onClick={() => setPaymentStatus(null)}
        >
          <div
            className={
              paymentStatus === "success"
                ? `${style.paymentBanner} ${style.paymentBannerSuccess}`
                : `${style.paymentBanner} ${style.paymentBannerError}`
            }
          >
            <button
              onClick={() => setPaymentStatus(null)}
              className={style.paymentBannerClose}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
            {paymentStatus === "success" ? (
              <>
                <p className={style.paymentBannerTitle}>
                  ¡Felicitaciones por tu compra!
                </p>
                <p className={style.paymentBannerText}>
                  En breve nos vamos a comunicar con vos para coordinar la entrega.
                </p>
              </>
            ) : (
              <>
                <p className={style.paymentBannerTitle}>Algo salió mal</p>
                <p className={style.paymentBannerText}>
                  No pudimos confirmar tu pago. Tu carrito sigue igual que lo
                  dejaste, podés intentar de nuevo cuando quieras.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className={style.design}>
        <div className={style.presentacion}>
          <h1>BakeryApp</h1>
          <svg className={style.brushStroke} viewBox="0 0 220 24" aria-hidden="true">
            <path className={style.brushPath} d="M6 14 C 60 4, 160 22, 214 10" />
          </svg>
          <h2>[baked goods & cookies]</h2>
          <Link to="/products" className={style.heroCta}>
            Ver productos →
          </Link>
        </div>
      </div>
      {/* <ProductsHome/> */}
    </div>
  );
}

export default Home;
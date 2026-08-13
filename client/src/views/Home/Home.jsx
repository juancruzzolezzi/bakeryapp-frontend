import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
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

  return (
    <div className={style.mainContainer}>
      <NavBarHome />

      {paymentStatus && (
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
      )}

      <div className={style.design}>
        <div className={style.presentacion}>
          <h1>BakeryApp</h1>
          <h2>[baked goods & cookies]</h2>
        </div>
      </div>
      {/* <ProductsHome/> */}
    </div>
  );
}

export default Home;
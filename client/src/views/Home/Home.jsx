import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import style from "./Home.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import { emptyCart } from "../../redux/slice/homeSlice";
import { playConfetti } from "../../utils/confetti";
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

  //Ráfaga de confetti sobre el cartel de compra exitosa, apenas aparece.
  const successBannerRef = useRef(null);

  useEffect(() => {
    if (paymentStatus === "success" && successBannerRef.current) {
      playConfetti(successBannerRef.current);
    }
  }, [paymentStatus]);

  //Comprobante imprimible: usa el pedido guardado justo antes de ir a
  //pagar (ver cartHandlers.js) para poder mostrar el detalle acá, ya que
  //el carrito real ya se vació (dispatch(emptyCart()) más arriba).
  const [lastOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lastOrder"));
    } catch {
      return null;
    }
  });

  const imprimirComprobante = () => window.print();

  return (
    <div className={style.mainContainer}>
      <div data-print-hide>
        <NavBarHome />
      </div>

      {paymentStatus && (
        <div
          className={style.paymentOverlay}
          data-payment-banner="true"
          onClick={() => setPaymentStatus(null)}
        >
          <div
            ref={successBannerRef}
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
              data-print-hide
            >
              ✕
            </button>
            {paymentStatus === "success" ? (
              <>
                <div className={style.successCheck} aria-hidden="true">
                  ✓
                </div>
                <p className={style.paymentBannerTitle}>
                  ¡Felicitaciones por tu compra!
                </p>
                <p className={style.paymentBannerText}>
                  En breve nos vamos a comunicar con vos para coordinar la entrega.
                </p>

                {lastOrder?.items?.length > 0 && (
                  <div className={style.receipt}>
                    <p className={style.receiptTitle}>Comprobante de tu pedido</p>
                    {lastOrder.date && (
                      <p className={style.receiptDate}>
                        {new Date(lastOrder.date).toLocaleString("es-AR")}
                      </p>
                    )}
                    <div className={style.receiptItems}>
                      {lastOrder.items.map((item) => (
                        <div key={item.id} className={style.receiptRow}>
                          <span>
                            {item.quantity}x {item.title}
                          </span>
                          <span>
                            ${(item.price * item.quantity).toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className={style.receiptTotal}>
                      <span>Total</span>
                      <span>
                        $
                        {lastOrder.items
                          .reduce((sum, item) => sum + item.price * item.quantity, 0)
                          .toLocaleString("es-AR")}
                      </span>
                    </div>

                    <button
                      onClick={imprimirComprobante}
                      className={style.printBtn}
                      data-print-hide
                    >
                      Imprimir comprobante
                    </button>
                  </div>
                )}
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

      <div className={style.design} data-print-hide>
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
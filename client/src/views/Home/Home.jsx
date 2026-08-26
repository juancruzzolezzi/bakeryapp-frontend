import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import style from "./Home.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import { emptyCart } from "../../redux/slice/homeSlice";
import { playConfetti } from "../../utils/confetti";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import { isStandalone, isIOS } from "../../utils/pwa";
import { usePwaInstall } from "../../hooks/usePwaInstall";
// import ProductsHome from "../../components/ProductsHome/ProductsHome";

function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state.authSlice.user);
  const openAuthModal = useAuthModal();
  const showToast = useToast();
  const { canInstall, promptInstall } = usePwaInstall();

  //Al no haber una API que garantice mostrar el instalador nativo en
  //cualquier navegador (ver usePwaInstall.js), esto siempre da algún tipo
  //de respuesta al tocar en vez de quedarse callado si "canInstall" es
  //falso: intenta instalar de verdad si el navegador lo permite, y si no,
  //explica cómo hacerlo a mano.
  const handleDescargarApp = async () => {
    if (canInstall) {
      const instalada = await promptInstall();
      if (instalada) showToast("¡App instalada!", "🎉");
      return;
    }

    showToast(
      isIOS()
        ? "Tocá compartir (⬆️) y elegí \"Agregar a inicio\""
        : "Buscá \"Instalar app\" en el menú (⋮) de tu navegador",
      "📲"
    );
  };
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

          {/* Iniciar sesión (y el 10% OFF que viene con la cuenta) es una
              función solo de la app instalada, no de la web normal: ver
              AccountButton.jsx. */}
          {!user && isStandalone() && (
            <div className={style.discountBanner} data-print-hide>
              <p className={style.discountBannerText}>
                🔓 Iniciá sesión y llevate 10% OFF en toda la tienda
              </p>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className={style.discountBannerBtn}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className={style.discountBannerLink}
              >
                ¿No tenés cuenta? Registrate
              </button>
            </div>
          )}

          {/* En la web normal (no la app instalada) no tiene sentido
              ofrecer login: en cambio, invita a instalar la app, que es
              donde vive esa función y el 10% OFF. Todo el texto es un link
              clickeable (ver handleDescargarApp): si el navegador lo
              permite, instala directo; si no, explica cómo hacerlo a mano
              en vez de no responder nada. */}
          {!isStandalone() && (
            <button
              type="button"
              onClick={handleDescargarApp}
              className={style.installBanner}
              data-print-hide
            >
              📲 Descargá la app y llevate 10% OFF en toda la tienda
            </button>
          )}
        </div>
      </div>
      {/* <ProductsHome/> */}
    </div>
  );
}

export default Home;
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faStar,
  faLocationDot,
  faClock,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import style from "./Home.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import Footer from "../../components/Footer/Footer";
import FlautaGame from "../../components/FlautaGame/FlautaGame";
import { useGetProductsQuery } from "../../api/appApi";
import { CONTACTO } from "../../constants/contacto";
import { DIFERENCIALES } from "../../constants/diferenciales";
import { estaAbiertoAhora } from "../../utils/horarioLocal";
import { emptyCart } from "../../redux/slice/homeSlice";
import { playConfetti } from "../../utils/confetti";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import { isStandalone, isIOS } from "../../utils/pwa";
import { usePwaInstall } from "../../hooks/usePwaInstall";

//Si todavía no hay ventas registradas (ver "sold" en la API), se muestran
//estos como destacados en vez de un orden arbitrario.
//TODO: ajustar a los productos que el local quiera destacar.
const DESTACADOS_POR_DEFECTO = [
  "Medialunas de Manteca",
  "Torta Red Velvet",
  "Cookies de Chocolate",
  "Cheesecake de Frutos Rojos",
];
const CANTIDAD_DESTACADOS = 4;

//Textos de la cinta dorada debajo del hero.
const CINTA = [
  "Horneado en el día",
  "Café de especialidad",
  "Formación Gato Dumas",
  "Eventos y mesas dulces",
  "Pet-friendly",
  "Sin TACC y veganos",
];

//Los más vendidos primero; los que empatan (ej: todos en 0 al principio)
//siguen el orden de DESTACADOS_POR_DEFECTO.
const elegirDestacados = (products) => {
  const prioridad = (p) => {
    const i = DESTACADOS_POR_DEFECTO.indexOf(p.title);
    return i === -1 ? DESTACADOS_POR_DEFECTO.length : i;
  };
  return [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0) || prioridad(a) - prioridad(b))
    .slice(0, CANTIDAD_DESTACADOS);
};

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACTO.direccion
)}`;

function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((state) => state.authSlice.user);
  const openAuthModal = useAuthModal();
  const showToast = useToast();
  const { canInstall, promptInstall } = usePwaInstall();
  const { data: products, isLoading: productsLoading } = useGetProductsQuery();
  const destacados = products ? elegirDestacados(products) : [];
  const abierto = estaAbiertoAhora(CONTACTO.horarioAtencion);

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

      <section className={style.hero} data-print-hide>
      <div className={style.design}>
        <div className={style.presentacion}>
          <h1>Bakery</h1>
          <svg className={style.brushStroke} viewBox="0 0 220 24" aria-hidden="true">
            <path className={style.brushPath} d="M6 14 C 60 4, 160 22, 214 10" />
          </svg>
          <h2>Pastelería artesanal, horneada en el día</h2>
          <div className={style.heroActions}>
            <Link to="/products" className={style.heroCta}>
              Hacer mi pedido →
            </Link>
            <a href="#visitanos" className={style.heroSecondary}>
              Visitanos
            </a>
          </div>
          <span
            className={`${style.statusBadge} ${
              abierto ? style.statusOpen : style.statusClosed
            }`}
          >
            <span className={style.statusDot} />
            {abierto ? "Abierto ahora" : "Cerrado ahora"} · {CONTACTO.horario}
          </span>

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
      </section>

      <div className={style.sections} data-print-hide>
        {/* Cinta dorada que se desplaza sola entre el hero y el resto: un
            poco de movimiento y los diferenciales de un vistazo. La lista
            va dos veces para que el loop no tenga corte (ver .marqueeTrack). */}
        <div className={style.marquee} aria-hidden="true">
          <div className={style.marqueeTrack}>
            {[0, 1].map((copia) => (
              <div key={copia} className={style.marqueeGroup}>
                {CINTA.map((texto) => (
                  <span key={texto} className={style.marqueeItem}>
                    {texto}
                    <span className={style.marqueeStar}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section
          className={`${style.band} ${style.bandCream}`}
          aria-labelledby="home-valor"
        >
          <div className={`${style.inner} ${style.storyGrid}`}>
            <div className={style.collage}>
              <img
                src="/img/medialunas.jpg"
                alt="Medialunas recién horneadas"
                className={`${style.collagePhoto} ${style.collageMain}`}
                loading="lazy"
                decoding="async"
              />
              <img
                src="/img/cafe.jpg"
                alt="Café de especialidad con arte latte"
                className={`${style.collagePhoto} ${style.collageSide}`}
                loading="lazy"
                decoding="async"
              />
              {/* Sello circular con texto en ronda, como el sticker de
                  una caja de pastelería. */}
              <svg
                className={style.stamp}
                viewBox="0 0 120 120"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="stampCircle"
                    d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                  />
                </defs>
                <circle cx="60" cy="60" r="58" className={style.stampBg} />
                {/* textLength: estira el texto justo a la circunferencia
                    del círculo (2π·44 ≈ 276), así la ronda cierra pareja. */}
                <text className={style.stampText}>
                  <textPath
                    href="#stampCircle"
                    textLength="272"
                    lengthAdjust="spacing"
                  >
                    HECHO A MANO ✦ DESDE EL HORNO ✦
                  </textPath>
                </text>
                <text x="60" y="68" textAnchor="middle" className={style.stampIcon}>
                  ✦
                </text>
              </svg>
            </div>

            <div>
              <p className={style.eyebrow}>Por qué Bakery</p>
              <h2 id="home-valor" className={style.sectionTitle}>
                Hecho a mano, <em>cada mañana</em>
              </h2>
              <p className={style.sectionLead}>
                Pastelería de autor y café de especialidad en Belgrano. Pedí
                online y recibilo en tu casa, o vení a disfrutarlo al local.
              </p>
              <ul className={style.featureList}>
                {DIFERENCIALES.map((item) => (
                  <li key={item.titulo} className={style.feature}>
                    <span className={style.featureIcon} aria-hidden="true">
                      <FontAwesomeIcon icon={item.icono} />
                    </span>
                    <div>
                      <h3>{item.titulo}</h3>
                      <p>{item.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className={`${style.band} ${style.bandHoney}`}
          aria-labelledby="home-jueguito"
        >
          <div className={`${style.inner} ${style.gameGrid}`}>
            <div>
              <p className={style.eyebrow}>Un recreo</p>
              <h2 id="home-jueguito" className={style.sectionTitle}>
                ¿Cuántos toques le hacés <em>a la flauta?</em>
              </h2>
              <p className={style.sectionLead}>
                Tocá la flauta para que salte y no la dejes caer en la mesada.
                Según dónde le pegues, sale derecha o girando. Tu récord queda
                guardado en este dispositivo.
              </p>
            </div>
            <FlautaGame />
          </div>
        </section>

        {/* Si la API falla, la sección directamente no se muestra (el
            resto del Home no depende de los productos). */}
        {(productsLoading || destacados.length > 0) && (
          <section
            className={`${style.band} ${style.bandDark}`}
            aria-labelledby="home-destacados"
          >
            <div className={style.inner}>
              <div className={style.sectionHeader}>
                <div>
                  <p className={style.eyebrow}>Destacados</p>
                  <h2 id="home-destacados" className={style.sectionTitle}>
                    Los más <em>pedidos</em>
                  </h2>
                </div>
                <Link to="/products" className={style.headerLink}>
                  Ver todo el catálogo <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <div className={style.featuredGrid}>
                {productsLoading
                  ? Array.from({ length: CANTIDAD_DESTACADOS }).map((_, i) => (
                      <div key={i} className={style.featuredSkeleton} />
                    ))
                  : destacados.map((product, index) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className={style.featuredCard}
                      >
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        {index === 0 && (
                          <span className={style.featuredBadge}>
                            <FontAwesomeIcon icon={faStar} /> El favorito
                          </span>
                        )}
                        <div className={style.featuredOverlay}>
                          <span className={style.featuredCategory}>
                            {product.category}
                          </span>
                          <span className={style.featuredName}>{product.title}</span>
                          <span className={style.featuredPrice}>
                            ${product.price.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="visitanos"
          className={`${style.band} ${style.bandCream}`}
          aria-labelledby="home-visitanos"
        >
          <div className={`${style.inner} ${style.visitGrid}`}>
            <div className={style.visitInfo}>
              <p className={style.eyebrow}>Visitanos</p>
              <h2 id="home-visitanos" className={style.sectionTitle}>
                Te esperamos <em>en Belgrano</em>
              </h2>
              <span
                className={`${style.statusBadge} ${style.statusBadgeLight} ${
                  abierto ? style.statusOpen : style.statusClosed
                }`}
              >
                <span className={style.statusDot} />
                {abierto ? "Abierto ahora" : "Cerrado ahora"}
              </span>

              <ul className={style.visitList}>
                <li>
                  <span className={style.visitIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </span>
                  <div>
                    <span className={style.visitLabel}>Dirección</span>
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                      {CONTACTO.direccion}
                    </a>
                  </div>
                </li>
                <li>
                  <span className={style.visitIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faClock} />
                  </span>
                  <div>
                    <span className={style.visitLabel}>Horario</span>
                    <span>{CONTACTO.horario}</span>
                  </div>
                </li>
                <li>
                  <span className={style.visitIcon} aria-hidden="true">
                    <FontAwesomeIcon icon={faTruckFast} />
                  </span>
                  <div>
                    <span className={style.visitLabel}>Entrega</span>
                    <span>Delivery en Belgrano y barrios cercanos, o take away.</span>
                  </div>
                </li>
              </ul>

              <div className={style.visitActions}>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={style.darkBtn}
                >
                  Cómo llegar
                </a>
                <a
                  href={`https://wa.me/${CONTACTO.whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={style.outlineDarkBtn}
                >
                  Escribinos
                </a>
              </div>
            </div>

            <div className={style.mapFrame}>
              <iframe
                title={`Mapa: ${CONTACTO.direccion}`}
                className={style.map}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  CONTACTO.direccion + ", CABA"
                )}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section className={style.ctaBand}>
          <div className={style.ctaContent}>
            <p className={style.eyebrow}>Tu pedido, en minutos</p>
            <h2 className={style.ctaTitle}>¿Se te antojó algo?</h2>
            <p className={style.ctaText}>
              Armá tu pedido y pagalo con Mercado Pago. Lo recibís en tu casa o
              lo retirás en el local.
            </p>
            <Link to="/products" className={style.heroCta}>
              Hacer mi pedido →
            </Link>
          </div>
        </section>

        <div className={style.footerWrap}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Home;
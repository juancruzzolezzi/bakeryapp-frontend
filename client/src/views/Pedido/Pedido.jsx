import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NavBar from "../../components/Navs/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { useGetPedidoQuery } from "../../api/appApi";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useRepetirPedido } from "../../hooks/useRepetirPedido";
import { CONTACTO } from "../../constants/contacto";
import {
  encabezadoPedido,
  esDelivery,
  formatearDia,
  formatearHora,
  formatearPrecio,
  pasosDelPedido,
} from "../../utils/pedidos";
import styles from "./Pedido.module.css";

//Cada cuánto se vuelve a consultar el estado mientras la página está
//abierta (el local lo cambia desde el panel).
const ACTUALIZAR_CADA_MS = 30000;

const IconoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const IconoWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
  </svg>
);

const IconoRepetir = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
    <path d="M20 4v4.5h-4.5" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
    <path d="M4 20v-4.5h4.5" />
  </svg>
);

const IconoPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const Pedido = () => {
  const { token } = useParams();
  const [repetirPedido, catalogoListo] = useRepetirPedido();

  //Se deja de consultar cuando ya se entregó: no va a cambiar más.
  const [actualizar, setActualizar] = useState(true);
  const { data: pedido, isLoading, isError } = useGetPedidoQuery(token, {
    pollingInterval: actualizar ? ACTUALIZAR_CADA_MS : 0,
  });
  useEffect(() => {
    if (pedido?.status === "entregado") setActualizar(false);
  }, [pedido?.status]);

  usePageMeta(
    pedido ? `Pedido ${pedido.code} | Bakery` : isError ? "Pedido no encontrado | Bakery" : null,
    "Seguí en qué paso está tu pedido de Bakery."
  );

  const contenido = () => {
    if (isLoading) {
      return <p className={styles.stateMessage}>Buscando tu pedido…</p>;
    }
    if (isError || !pedido) {
      return (
        <div className={styles.notFound}>
          <h1>No encontramos ese pedido</h1>
          <p>
            Revisá que el link sea el del mail de confirmación. Si el problema
            sigue, escribinos por WhatsApp al {CONTACTO.whatsappTexto}.
          </p>
          <Link to="/" className={styles.primaryBtn}>Volver al inicio</Link>
        </div>
      );
    }

    const [titulo, bajada] = encabezadoPedido(pedido);
    const pasos = pasosDelPedido(pedido);
    const delivery = esDelivery(pedido);
    const mensajeWhatsApp = encodeURIComponent(`¡Hola! Te escribo por mi pedido ${pedido.code}.`);
    const linkWhatsApp = `https://wa.me/${CONTACTO.whatsappNumero}?text=${mensajeWhatsApp}`;

    return (
      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section className={styles.hero} aria-live="polite">
            <p className={styles.eyebrow}>
              Pedido {pedido.code} · {formatearDia(pedido.createdAt)}, {formatearHora(pedido.createdAt)}
            </p>
            <h1 className={styles.title}>{titulo}</h1>
            <p className={styles.subtitle}>{bajada}</p>
            <div className={styles.progress} aria-hidden="true">
              {pasos.map((paso) => (
                <span
                  key={paso.estado}
                  className={paso.hecho || paso.actual ? styles.progressOn : styles.progressOff}
                />
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Estado</h2>
            <ol className={styles.steps}>
              {pasos.map((paso, i) => (
                <li key={paso.estado} className={styles.step} aria-current={paso.actual ? "step" : undefined}>
                  <div className={styles.stepRail}>
                    <span
                      className={`${styles.dot} ${
                        paso.hecho ? styles.dotDone : paso.actual ? styles.dotCurrent : styles.dotPending
                      }`}
                    >
                      {paso.hecho && <IconoCheck />}
                    </span>
                    {i < pasos.length - 1 && (
                      <span className={`${styles.line} ${paso.hecho ? styles.lineDone : ""}`} />
                    )}
                  </div>
                  <div className={styles.stepBody}>
                    <div className={styles.stepHead}>
                      <span
                        className={`${styles.stepTitle} ${
                          paso.actual ? styles.stepTitleCurrent : !paso.hecho ? styles.stepTitlePending : ""
                        }`}
                      >
                        {paso.titulo}
                      </span>
                      <span className={styles.stepTime}>{paso.hora}</span>
                    </div>
                    <span className={styles.stepDetail}>{paso.detalle}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className={styles.infoRow}>
            <section className={`${styles.card} ${styles.infoCard}`}>
              <span className={styles.infoIcon}><IconoPin /></span>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>{delivery ? "Delivery" : "Take away"}</span>
                <span className={styles.infoMain}>
                  {delivery
                    ? [pedido.address, pedido.deliveryZone].filter(Boolean).join(" · ")
                    : CONTACTO.direccion}
                </span>
                <span className={styles.infoSub}>
                  {pedido.contact
                    ? `Te contactamos por ${pedido.contactMethod === "whatsapp" ? "WhatsApp" : "Instagram"} (${pedido.contact}).`
                    : CONTACTO.horario}
                </span>
              </div>
            </section>
            <section className={`${styles.card} ${styles.infoCard}`}>
              <span className={styles.infoIcon}><IconoWhatsApp /></span>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>¿Algo no está bien?</span>
                <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                  Escribinos por WhatsApp
                </a>
                <span className={styles.infoSub}>
                  {CONTACTO.whatsappTexto} · <Link to="/arrepentimiento">Botón de arrepentimiento</Link>
                </span>
              </div>
            </section>
          </div>
        </div>

        <aside className={`${styles.card} ${styles.summary}`}>
          <h2 className={styles.cardTitle}>Tu pedido</h2>
          <ul className={styles.items}>
            {pedido.items.map((item) => (
              <li key={item.id} className={styles.item}>
                {item.image ? (
                  <img src={item.image} alt="" className={styles.itemImg} loading="lazy" />
                ) : (
                  <span className={styles.itemImg} aria-hidden="true" />
                )}
                <div className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemQty}>
                    {item.quantity} × {formatearPrecio(item.unit_price)}
                  </span>
                </div>
                <span className={styles.itemPrice}>{formatearPrecio(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.totals}>
            {pedido.discount > 0 && (
              <div className={styles.totalRow}>
                <span>Descuento por tu cuenta</span>
                <span>-{formatearPrecio(pedido.discount)}</span>
              </div>
            )}
            {delivery && (
              <div className={styles.totalRow}>
                <span>Envío</span>
                <span>{pedido.shipping > 0 ? formatearPrecio(pedido.shipping) : "Gratis"}</span>
              </div>
            )}
            <div className={styles.totalFinal}>
              <span>{pedido.status === "pendiente_pago" ? "Total" : "Total pagado"}</span>
              <span>{formatearPrecio(pedido.total)}</span>
            </div>
          </div>
          <button type="button" className={styles.primaryBtn} onClick={() => repetirPedido(pedido)} disabled={!catalogoListo}>
            <IconoRepetir />
            Repetir este pedido
          </button>
          <p className={styles.note}>Este link es tu comprobante: guardalo para volver a ver el pedido.</p>
        </aside>
      </div>
    );
  };

  return (
    <div className={`catalogoClaro ${styles.container}`}>
      <NavBar claro />
      <div className={styles.topBand} aria-hidden="true" />
      <main className={styles.page}>{contenido()}</main>
      <div className={styles.footerBand}>
        <Footer />
      </div>
    </div>
  );
};

export default Pedido;

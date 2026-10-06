import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "../../components/Navs/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { useGetMisPedidosQuery } from "../../api/appApi";
import { useAuthModal } from "../../context/AuthModalContext";
import { useRepetirPedido } from "../../hooks/useRepetirPedido";
import {
  etiquetaEstado,
  formatearDia,
  formatearHora,
  formatearPrecio,
  resumenItems,
} from "../../utils/pedidos";
import styles from "./MisPedidos.module.css";

const IconoFlecha = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const MisPedidos = () => {
  const user = useSelector((state) => state.authSlice.user);
  const openAuthModal = useAuthModal();
  const [repetirPedido, catalogoListo] = useRepetirPedido();
  const { data: pedidos, isLoading, isError } = useGetMisPedidosQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });

  const enCurso = (pedidos || []).filter((p) => p.status !== "entregado");
  const anteriores = (pedidos || []).filter((p) => p.status === "entregado");

  const contenido = () => {
    if (!user) {
      return (
        <div className={styles.empty}>
          <p>Iniciá sesión para ver tus pedidos.</p>
          <button type="button" className={styles.primaryBtn} onClick={() => openAuthModal("login")}>
            Iniciar sesión
          </button>
        </div>
      );
    }
    if (isLoading) return <p className={styles.stateMessage}>Cargando tus pedidos…</p>;
    if (isError) {
      return <p className={styles.stateMessage}>No pudimos cargar tus pedidos. Probá de nuevo en un rato.</p>;
    }
    if (pedidos.length === 0) {
      return (
        <div className={styles.empty}>
          <p>Todavía no hiciste ningún pedido con esta cuenta.</p>
          <Link to="/products" className={styles.primaryBtn}>Ver productos</Link>
        </div>
      );
    }

    return (
      <>
        {enCurso.map((pedido) => (
          <article key={pedido.token} className={styles.current}>
            <div className={styles.cardHead}>
              <span className={styles.currentMeta}>
                {pedido.code} · {formatearDia(pedido.createdAt)}, {formatearHora(pedido.createdAt)}
              </span>
              <span className={styles.chipCurrent}>{etiquetaEstado(pedido)}</span>
            </div>
            <div className={styles.currentBody}>
              <div className={styles.thumbs} aria-hidden="true">
                {pedido.items.slice(0, 3).map((item) =>
                  item.image ? <img key={item.id} src={item.image} alt="" loading="lazy" /> : null
                )}
              </div>
              <span className={styles.currentItems}>{resumenItems(pedido)}</span>
            </div>
            <Link to={`/pedido/${pedido.token}`} className={styles.goldBtn}>
              Seguir mi pedido
              <IconoFlecha />
            </Link>
          </article>
        ))}

        {anteriores.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>Anteriores</h2>
            <ul className={styles.list}>
              {anteriores.map((pedido) => (
                <li key={pedido.token} className={styles.past}>
                  <div className={styles.cardHead}>
                    <Link to={`/pedido/${pedido.token}`} className={styles.pastMeta}>
                      {pedido.code} · {formatearDia(pedido.createdAt)}
                    </Link>
                    <span className={styles.chipDone}>{etiquetaEstado(pedido)}</span>
                  </div>
                  <span className={styles.pastItems}>{resumenItems(pedido)}</span>
                  <div className={styles.pastFoot}>
                    <span className={styles.pastTotal}>
                      {formatearPrecio(pedido.total)}
                      {pedido.discount > 0 && <span className={styles.pastDiscount}> con 10% OFF</span>}
                    </span>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => repetirPedido(pedido)}
                      disabled={!catalogoListo}
                    >
                      Repetir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  };

  return (
    <div className={`catalogoClaro ${styles.container}`}>
      <NavBar claro />
      <div className={styles.topBand} aria-hidden="true" />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mis pedidos</h1>
          {user && (
            <p className={styles.lede}>Hola, {user.username}. Tus compras tienen 10% OFF por tener cuenta.</p>
          )}
        </header>
        {contenido()}
      </main>
      <div className={styles.footerBand}>
        <Footer />
      </div>
    </div>
  );
};

export default MisPedidos;

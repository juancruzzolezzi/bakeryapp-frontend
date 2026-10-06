import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCambiarEstadoPedidoMutation, useGetPedidosLocalQuery } from "../../api/appApi";
import { useToast } from "../../context/ToastContext";
import {
  ORDEN_ESTADOS,
  accionSiguiente,
  esDelivery,
  etiquetaEstado,
  formatearHora,
  formatearPrecio,
  resumenItems,
} from "../../utils/pedidos";
import styles from "./Panel.module.css";

//La clave del panel (ADMIN_KEY del backend) queda guardada en este
//dispositivo, para no tener que escribirla cada vez que se abre.
const CLAVE_STORAGE = "panelAdminKey";
const leerClave = () => {
  try {
    return localStorage.getItem(CLAVE_STORAGE) || "";
  } catch {
    return "";
  }
};
const guardarClave = (clave) => {
  try {
    if (clave) localStorage.setItem(CLAVE_STORAGE, clave);
    else localStorage.removeItem(CLAVE_STORAGE);
  } catch {
    /* sin localStorage: la clave dura lo que la pestaña */
  }
};

const ACTUALIZAR_CADA_MS = 30000;

const COLUMNAS = [
  { estado: "recibido", titulo: "Recibidos", className: "colRecibido" },
  { estado: "preparacion", titulo: "En preparación", className: "colPreparacion" },
  { estado: "camino", titulo: "En camino o listos", className: "colCamino" },
  { estado: "entregado", titulo: "Entregados hoy", className: "colEntregado" },
];

//Link para escribirle al cliente por donde dejó su contacto.
const linkContacto = (pedido) => {
  if (pedido.contactMethod === "whatsapp") {
    const digitos = pedido.contact.replace(/\D/g, "");
    return digitos ? `https://wa.me/${digitos}?text=${encodeURIComponent(`¡Hola! Te escribimos de Bakery por tu pedido ${pedido.code}.`)}` : null;
  }
  const usuario = pedido.contact.replace(/^@/, "").trim();
  return usuario ? `https://instagram.com/${encodeURIComponent(usuario)}` : null;
};

const IngresarClave = ({ onIngresar, error }) => {
  const [clave, setClave] = useState("");
  const enviar = (e) => {
    e.preventDefault();
    if (clave.trim()) onIngresar(clave.trim());
  };
  return (
    <form className={styles.login} onSubmit={enviar}>
      <h1 className={styles.loginTitle}>Panel del local</h1>
      <p className={styles.loginText}>Ingresá la clave del panel para ver los pedidos.</p>
      <label htmlFor="panel-clave" className={styles.label}>Clave</label>
      <input
        id="panel-clave"
        type="password"
        autoComplete="current-password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        className={styles.input}
      />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" className={styles.primaryBtn}>Entrar</button>
    </form>
  );
};

const Panel = () => {
  const showToast = useToast();
  const [clave, setClave] = useState(leerClave);
  const [errorClave, setErrorClave] = useState("");

  const { data: pedidos, error, isLoading, isFetching, refetch } = useGetPedidosLocalQuery(clave, {
    skip: !clave,
    pollingInterval: ACTUALIZAR_CADA_MS,
  });
  const [cambiarEstado, { isLoading: guardando }] = useCambiarEstadoPedidoMutation();

  //Clave incorrecta (o cambiada en el servidor): se borra y se vuelve a pedir.
  useEffect(() => {
    if (error?.status === 401 || error?.status === 503) {
      guardarClave("");
      setClave("");
      setErrorClave(
        error.status === 401
          ? "La clave no es correcta."
          : "El panel todavía no está configurado en el servidor (falta ADMIN_KEY)."
      );
    }
  }, [error]);

  const ingresar = (nueva) => {
    guardarClave(nueva);
    setErrorClave("");
    setClave(nueva);
  };

  const salir = () => {
    guardarClave("");
    setClave("");
  };

  const mover = async (pedido, status) => {
    try {
      await cambiarEstado({ adminKey: clave, id: pedido.id, status }).unwrap();
      showToast(`${pedido.code}: ${etiquetaEstado({ ...pedido, status })}`, "✓");
    } catch {
      showToast(`No se pudo actualizar ${pedido.code}. Probá de nuevo.`, "⚠️");
    }
  };

  if (!clave) {
    return (
      <div className={styles.container}>
        <IngresarClave onIngresar={ingresar} error={errorClave} />
      </div>
    );
  }

  const lista = pedidos || [];
  const pendientes = lista.filter((p) => p.status !== "entregado").length;

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>Bakery</Link>
            <span className={styles.brandLabel}>Panel del local</span>
          </div>
          <div className={styles.topbarActions}>
            <button type="button" className={styles.ghostBtn} onClick={refetch} disabled={isFetching}>
              {isFetching ? "Actualizando…" : "Actualizar"}
            </button>
            <button type="button" className={styles.ghostBtn} onClick={salir}>Salir</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.heading}>
          <div>
            <h1 className={styles.title}>Pedidos de hoy</h1>
            <p className={styles.subtitle}>
              Cada cambio le llega al cliente en su página de seguimiento. Se actualiza solo cada 30 segundos.
            </p>
          </div>
          <span className={styles.summary}>
            {pendientes} {pendientes === 1 ? "pendiente" : "pendientes"} · {lista.length - pendientes} entregados
          </span>
        </div>

        {isLoading ? (
          <p className={styles.subtitle}>Cargando pedidos…</p>
        ) : error && !pedidos ? (
          <p className={styles.error} role="alert">No pudimos cargar los pedidos. Revisá la conexión y tocá Actualizar.</p>
        ) : (
          <div className={styles.board}>
            {COLUMNAS.map((col) => {
              const delEstado = lista.filter((p) => p.status === col.estado);
              return (
                <section key={col.estado} className={styles.column} aria-label={col.titulo}>
                  <div className={styles.columnHead}>
                    <h2 className={styles.columnTitle}>{col.titulo}</h2>
                    <span className={`${styles.count} ${styles[col.className]}`}>{delEstado.length}</span>
                  </div>
                  {delEstado.length === 0 && <p className={styles.columnEmpty}>Sin pedidos acá</p>}
                  {delEstado.map((pedido) => {
                    const siguiente = accionSiguiente(pedido);
                    const indice = ORDEN_ESTADOS.indexOf(pedido.status);
                    const anterior = indice > 0 ? ORDEN_ESTADOS[indice - 1] : null;
                    const contacto = linkContacto(pedido);
                    return (
                      <article key={pedido.id} className={styles.card}>
                        <div className={styles.cardHead}>
                          <span className={styles.code}>{pedido.code}</span>
                          <span className={styles.time}>{formatearHora(pedido.paidAt || pedido.createdAt)}</span>
                        </div>
                        <span className={esDelivery(pedido) ? styles.tagDelivery : styles.tagTakeaway}>
                          {esDelivery(pedido) ? "Delivery" : "Take away"}
                        </span>
                        <span className={styles.items}>{resumenItems(pedido)}</span>
                        <span className={styles.meta}>
                          {esDelivery(pedido)
                            ? [pedido.address, pedido.deliveryZone].filter(Boolean).join(" · ")
                            : "Retira en el local"}
                        </span>
                        <div className={styles.cardFoot}>
                          <span className={styles.total}>{formatearPrecio(pedido.total)}</span>
                          {contacto ? (
                            <a href={contacto} target="_blank" rel="noopener noreferrer" className={styles.contact}>
                              {pedido.contactMethod === "whatsapp" ? "WhatsApp" : "Instagram"}: {pedido.contact}
                            </a>
                          ) : (
                            <span className={styles.meta}>{pedido.contact}</span>
                          )}
                        </div>
                        {siguiente && (
                          <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={() => mover(pedido, siguiente.estado)}
                            disabled={guardando}
                          >
                            {siguiente.texto}
                          </button>
                        )}
                        {anterior && (
                          <button
                            type="button"
                            className={styles.undoBtn}
                            onClick={() => mover(pedido, anterior)}
                            disabled={guardando}
                          >
                            Volver a "{etiquetaEstado({ ...pedido, status: anterior })}"
                          </button>
                        )}
                      </article>
                    );
                  })}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Panel;

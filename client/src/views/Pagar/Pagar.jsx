import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCartHandlers } from "../../handlers/cartHandlers";
import { validations } from "../../validations/validations";
import { ACCOUNT_DISCOUNT_RATE } from "../../utils/discount";
import { getSavedAddress } from "../../utils/savedAddress";
import { isStandalone } from "../../utils/pwa";
import { useAuthModal } from "../../context/AuthModalContext";
import { CONTACTO } from "../../constants/contacto";
import {
  DELIVERY_ZONES,
  DELIVERY_FEE,
  FREE_SHIPPING_THRESHOLD,
} from "../../constants/deliveryZones";
import { diasParaProgramar, productosPorEncargo, textoCuantoAntes } from "../../utils/entrega";
import styles from "./Pagar.module.css";

// Página de pago (reemplaza al modal que se abría encima del carrito).
// Formulario a la izquierda y resumen a la derecha; en el celular, el
// resumen se despliega arriba y "Pagar" queda fijo abajo.

// Valor del selector de barrio para "no está en la lista": no es una zona
// de cobertura, así que bloquea el pago con delivery.
const OTRA_ZONA = "otra";
const NOTA_MAX = 300;

const formatearPrecio = (monto) => `$${Math.round(monto).toLocaleString("es-AR")}`;

//Último contacto usado en este dispositivo, para no pedirlo cada vez.
const leerUltimoContacto = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem("lastContact"));
    return guardado && typeof guardado.value === "string" ? guardado : {};
  } catch {
    return {};
  }
};

const IconoCandado = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const IconoVolver = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

const IconoFlecha = ({ abierto }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: abierto ? "rotate(180deg)" : "none" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Pagar = () => {
  const cartList = useSelector((state) => state.homeSlice.cartList);
  const user = useSelector((state) => state.authSlice.user);
  const isLoggedIn = Boolean(user);
  const openAuthModal = useAuthModal();
  const { handleSubmitModal, isSubmitting, submitError } = useCartHandlers();
  const { isValidInstagramUsername, isValidWhatsAppNumber, isValidAddress } = validations();

  // ---------- Entrega ----------
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [deliveryZone, setDeliveryZone] = useState(() => {
    const last = localStorage.getItem("lastZone");
    return DELIVERY_ZONES.includes(last) ? last : "";
  });
  //Precarga con la dirección guardada en la cuenta o, si no, con la
  //última usada en este dispositivo. Sigue siendo editable.
  const [address, setAddress] = useState(
    () => getSavedAddress(user?.id) || localStorage.getItem("lastAddress") || ""
  );
  const [addressTouched, setAddressTouched] = useState(false);
  const esDelivery = deliveryType === "delivery";
  const fueraDeZona = deliveryZone === OTRA_ZONA;

  // ---------- Cuándo ----------
  //Si hay algo por encargo (tortas), "cuanto antes" no corre: se programa.
  const encargos = productosPorEncargo(cartList);
  const conEncargo = encargos.length > 0;
  const dias = useMemo(() => diasParaProgramar({ conEncargo }), [conEncargo]);
  const [cuandoElegido, setCuandoElegido] = useState("asap");
  const cuando = conEncargo ? "programado" : cuandoElegido;
  const [fechaElegida, setFechaElegida] = useState("");
  //Si la fecha elegida dejó de estar disponible (ej: se sumó una torta),
  //se pasa sola al primer día posible.
  const diaElegido = dias.find((d) => d.fecha === fechaElegida) || dias[0];

  // ---------- Contacto y nota ----------
  const [contactMethod, setContactMethod] = useState(() => leerUltimoContacto().method || "whatsapp");
  const [contactValue, setContactValue] = useState(() => leerUltimoContacto().value || "");
  const [contactTouched, setContactTouched] = useState(false);
  const [nota, setNota] = useState("");

  const [intentoPagar, setIntentoPagar] = useState(false);
  const [resumenAbierto, setResumenAbierto] = useState(false);

  // ---------- Montos ----------
  const unidades = cartList.reduce((sum, p) => sum + p.quantity, 0);
  const subtotal = cartList.reduce((sum, p) => sum + p.price * p.quantity, 0);
  //Mismo cálculo que el backend (pricing.js): el mínimo para envío gratis
  //se mide sin descuento, y el backend es el que cobra de verdad.
  const descuento = isLoggedIn ? subtotal * ACCOUNT_DISCOUNT_RATE : 0;
  const envioGratis = subtotal >= FREE_SHIPPING_THRESHOLD;
  const envio = esDelivery && !envioGratis ? DELIVERY_FEE : 0;
  const total = subtotal - descuento + envio;

  // ---------- Validación ----------
  const contactoValido =
    contactMethod === "instagram"
      ? isValidInstagramUsername(contactValue.trim())
      : isValidWhatsAppNumber(contactValue.trim());
  const zonaValida = !esDelivery || DELIVERY_ZONES.includes(deliveryZone);
  const direccionValida = !esDelivery || isValidAddress(address.trim());
  const cuandoValido = cuando === "asap" || Boolean(diaElegido);
  const puedePagar = contactoValido && zonaValida && direccionValida && cuandoValido && !isSubmitting;

  const mostrarErrorContacto = (contactTouched || intentoPagar) && !contactoValido;
  const mostrarErrorDireccion = (addressTouched || intentoPagar) && !direccionValida;
  const mostrarErrorZona = intentoPagar && esDelivery && !deliveryZone;

  const cambiarMetodoContacto = (method) => {
    setContactMethod(method);
    setContactValue("");
    setContactTouched(false);
  };

  const pagar = () => {
    setIntentoPagar(true);
    if (!puedePagar) return;

    if (esDelivery) {
      localStorage.setItem("lastAddress", address.trim());
      localStorage.setItem("lastZone", deliveryZone);
    }
    try {
      localStorage.setItem("lastContact", JSON.stringify({ method: contactMethod, value: contactValue.trim() }));
    } catch {
      /* sin localStorage: no se recuerda, nada más */
    }

    handleSubmitModal(
      cartList,
      contactValue.trim(),
      contactMethod,
      deliveryType,
      esDelivery ? address.trim() : "",
      esDelivery ? deliveryZone : "",
      {
        cuando,
        fechaEntrega: cuando === "programado" ? diaElegido.fecha : "",
        nota: nota.trim(),
      }
    );
  };

  const textoCuando =
    cuando === "asap" ? "Cuanto antes" : diaElegido ? `${diaElegido.corto} ${diaElegido.numero} · horario a coordinar` : "";

  //Resumen del pedido: aparece a la derecha en escritorio y desplegable
  //arriba en el celular.
  const Resumen = () => (
    <>
      <ul className={styles.items}>
        {cartList.map((product) => (
          <li key={product.id} className={styles.item}>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt="" className={styles.itemImg} />
            ) : (
              <span className={styles.itemImg} aria-hidden="true" />
            )}
            <span className={styles.itemText}>
              <span className={styles.itemTitle}>{product.title}</span>
              <span className={styles.itemQty}>
                {product.quantity} × {formatearPrecio(product.price)}
              </span>
            </span>
            <span className={styles.itemPrice}>{formatearPrecio(product.price * product.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.totals}>
        <div className={styles.totalRow}><span>Productos</span><span>{formatearPrecio(subtotal)}</span></div>
        {descuento > 0 && (
          <div className={styles.totalRow}><span>Descuento por tu cuenta</span><span>-{formatearPrecio(descuento)}</span></div>
        )}
        {esDelivery && (
          <div className={styles.totalRow}>
            <span>Envío</span>
            <span className={envio === 0 ? styles.gratis : ""}>{envio === 0 ? "Gratis" : formatearPrecio(envio)}</span>
          </div>
        )}
        {textoCuando && <div className={styles.totalRow}><span>Cuándo</span><span>{textoCuando}</span></div>}
        <div className={styles.totalFinal}><span>Total</span><span>{formatearPrecio(total)}</span></div>
      </div>
    </>
  );

  if (cartList.length === 0) {
    return (
      <div className={`catalogoClaro ${styles.container}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarInner}>
            <Link to="/" className={styles.logo}>Bakery</Link>
          </div>
        </header>
        <main className={styles.empty}>
          <h1 className={styles.title}>Tu pedido está vacío</h1>
          <p>Agregá algo del catálogo y volvé acá para pagar.</p>
          <Link to="/products" className={styles.payBtn}>Ver productos</Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`catalogoClaro ${styles.container}`}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link to="/products" className={styles.back}>
            <IconoVolver />
            Seguir comprando
          </Link>
          <Link to="/" className={styles.logo}>Bakery</Link>
          <span className={styles.secure}>
            <IconoCandado />
            Pagás con Mercado Pago
          </span>
        </div>
      </header>

      <main className={styles.page}>
        <h1 className={styles.title}>Finalizá tu pedido</h1>

        <div className={styles.mobileSummary}>
          <button
            type="button"
            className={styles.mobileSummaryBtn}
            aria-expanded={resumenAbierto}
            aria-controls="pagar-resumen-movil"
            onClick={() => setResumenAbierto((v) => !v)}
          >
            <span className={styles.thumbs} aria-hidden="true">
              {cartList.slice(0, 3).map((p) =>
                p.images?.[0] ? <img key={p.id} src={p.images[0]} alt="" /> : null
              )}
            </span>
            <span className={styles.mobileSummaryText}>
              <span className={styles.mobileSummaryCount}>
                {unidades} {unidades === 1 ? "unidad" : "unidades"}
              </span>
              <span className={styles.mobileSummaryHint}>{resumenAbierto ? "Ocultar detalle" : "Ver detalle"}</span>
            </span>
            <span className={styles.mobileSummaryTotal}>{formatearPrecio(total)}</span>
            <IconoFlecha abierto={resumenAbierto} />
          </button>
          {resumenAbierto && (
            <div id="pagar-resumen-movil" className={styles.mobileSummaryBody}>
              <Resumen />
            </div>
          )}
        </div>

        <div className={styles.layout}>
          <div className={styles.formCol}>
            {/* ---------- Entrega ---------- */}
            <section className={styles.card}>
              <fieldset className={styles.fieldset}>
                <legend className={styles.cardTitle}>Entrega</legend>
                <div className={styles.options}>
                  <label className={`${styles.option} ${esDelivery ? styles.optionOn : ""}`}>
                    <input type="radio" name="pagar-entrega" checked={esDelivery} onChange={() => setDeliveryType("delivery")} />
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>Delivery</span>
                      <span className={styles.optionSub}>Belgrano y barrios cercanos</span>
                    </span>
                    <span className={envioGratis ? styles.gratis : styles.optionAside}>
                      {envioGratis ? "Gratis" : formatearPrecio(DELIVERY_FEE)}
                    </span>
                  </label>
                  <label className={`${styles.option} ${!esDelivery ? styles.optionOn : ""}`}>
                    <input type="radio" name="pagar-entrega" checked={!esDelivery} onChange={() => setDeliveryType("takeaway")} />
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>Take away</span>
                      <span className={styles.optionSub}>{CONTACTO.direccion} · {CONTACTO.horario}</span>
                    </span>
                    <span className={styles.optionAside}>Sin costo</span>
                  </label>
                </div>
              </fieldset>

              {esDelivery && (
                <div className={styles.addressGrid}>
                  <div className={styles.field}>
                    <label htmlFor="pagar-barrio" className={styles.label}>Barrio</label>
                    <select
                      id="pagar-barrio"
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className={styles.input}
                      aria-invalid={mostrarErrorZona}
                    >
                      <option value="" disabled>Elegí tu barrio</option>
                      {DELIVERY_ZONES.map((zona) => (
                        <option key={zona} value={zona}>{zona}</option>
                      ))}
                      <option value={OTRA_ZONA}>Otro barrio</option>
                    </select>
                    {mostrarErrorZona && <span className={styles.error}>Elegí tu barrio.</span>}
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="pagar-direccion" className={styles.label}>Dirección</label>
                    <input
                      id="pagar-direccion"
                      type="text"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setAddressTouched(true);
                      }}
                      placeholder="Calle y número, piso y depto"
                      className={styles.input}
                      aria-invalid={mostrarErrorDireccion}
                    />
                    {mostrarErrorDireccion && (
                      <span className={styles.error}>Ingresá calle y número, por ejemplo: Zavalía 2026.</span>
                    )}
                  </div>
                  {fueraDeZona && (
                    <div className={styles.zoneWarning}>
                      <span>Todavía no hacemos delivery a tu zona. Podés retirarlo en el local sin costo.</span>
                      <button type="button" className={styles.linkBtn} onClick={() => setDeliveryType("takeaway")}>
                        Cambiar a take away
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ---------- Cuándo ---------- */}
            <section className={styles.card}>
              <fieldset className={styles.fieldset}>
                <legend className={styles.cardTitle}>¿Cuándo lo querés?</legend>
                <div className={styles.options}>
                  <label className={`${styles.option} ${cuando === "asap" ? styles.optionOn : ""} ${conEncargo ? styles.optionOff : ""}`}>
                    <input
                      type="radio"
                      name="pagar-cuando"
                      checked={cuando === "asap"}
                      disabled={conEncargo}
                      onChange={() => setCuandoElegido("asap")}
                    />
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>Cuanto antes</span>
                      <span className={styles.optionSub}>
                        {conEncargo
                          ? `No disponible: ${encargos.length === 1 ? encargos[0].title : "las tortas"} se ${encargos.length === 1 ? "encarga" : "encargan"} con 48 hs`
                          : textoCuantoAntes()}
                      </span>
                    </span>
                  </label>
                  <label className={`${styles.option} ${cuando === "programado" ? styles.optionOn : ""}`}>
                    <input
                      type="radio"
                      name="pagar-cuando"
                      checked={cuando === "programado"}
                      onChange={() => setCuandoElegido("programado")}
                    />
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>Programar para otro día</span>
                      <span className={styles.optionSub}>Para un cumpleaños, una reunión o una torta</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {cuando === "programado" && (
                <div className={styles.daysBlock}>
                  <span className={styles.label} id="pagar-dia-label">Elegí el día</span>
                  <div className={styles.days} role="radiogroup" aria-labelledby="pagar-dia-label">
                    {dias.map((dia) => {
                      const elegido = diaElegido?.fecha === dia.fecha;
                      return (
                        <button
                          key={dia.fecha}
                          type="button"
                          role="radio"
                          aria-checked={elegido}
                          aria-label={dia.largo}
                          className={`${styles.day} ${elegido ? styles.dayOn : ""}`}
                          onClick={() => setFechaElegida(dia.fecha)}
                        >
                          <span className={styles.dayName}>{dia.corto}</span>
                          <span className={styles.dayNum}>{dia.numero}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className={styles.hint}>El horario lo coordinamos por WhatsApp. Los domingos el local está cerrado.</span>
                </div>
              )}
            </section>

            {/* ---------- Contacto y nota ---------- */}
            <div className={styles.row2}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Contacto</h2>
                <div className={styles.field}>
                  <label htmlFor="pagar-contacto" className={styles.label}>
                    {contactMethod === "whatsapp" ? "Tu WhatsApp" : "Tu usuario de Instagram"}
                  </label>
                  <input
                    id="pagar-contacto"
                    type={contactMethod === "whatsapp" ? "tel" : "text"}
                    autoComplete={contactMethod === "whatsapp" ? "tel" : "off"}
                    value={contactValue}
                    onChange={(e) => {
                      setContactValue(e.target.value);
                      setContactTouched(true);
                    }}
                    placeholder={contactMethod === "whatsapp" ? "11 5555 4821" : "@tu_usuario"}
                    className={styles.input}
                    aria-invalid={mostrarErrorContacto}
                  />
                  {mostrarErrorContacto && (
                    <span className={styles.error}>
                      {contactMethod === "whatsapp"
                        ? "Ingresá tu número con código de área, por ejemplo: 11 5555 4821."
                        : "El usuario tiene que empezar con @, por ejemplo: @juanperez."}
                    </span>
                  )}
                  <span className={styles.hint}>
                    Te escribimos solo si hace falta coordinar algo.{" "}
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => cambiarMetodoContacto(contactMethod === "whatsapp" ? "instagram" : "whatsapp")}
                    >
                      {contactMethod === "whatsapp" ? "Prefiero Instagram" : "Prefiero WhatsApp"}
                    </button>
                  </span>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.field}>
                  <label htmlFor="pagar-nota" className={styles.cardTitle}>
                    Nota para el local <span className={styles.optional}>(opcional)</span>
                  </label>
                  <textarea
                    id="pagar-nota"
                    rows={3}
                    maxLength={NOTA_MAX}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Dedicatoria, alergias, timbre…"
                    className={`${styles.input} ${styles.textarea}`}
                  />
                  {nota.length > NOTA_MAX - 50 && (
                    <span className={styles.hint}>{NOTA_MAX - nota.length} caracteres disponibles</span>
                  )}
                </div>
              </section>
            </div>
          </div>

          <aside className={`${styles.card} ${styles.aside}`} aria-label="Resumen del pedido">
            <div className={styles.asideHead}>
              <h2 className={styles.cardTitle}>Tu pedido</h2>
              <span className={styles.itemQty}>{unidades} {unidades === 1 ? "unidad" : "unidades"}</span>
            </div>
            <Resumen />
            {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
            <button type="button" className={styles.payBtn} onClick={pagar} disabled={isSubmitting}>
              {isSubmitting ? "Te llevamos a Mercado Pago…" : "Pagar con Mercado Pago"}
            </button>
            {intentoPagar && !puedePagar && !isSubmitting && (
              <p className={styles.submitError} role="alert">Revisá los datos marcados antes de pagar.</p>
            )}
            {!isLoggedIn && isStandalone() && (
              <p className={styles.note}>
                Con tu cuenta pagás {formatearPrecio(subtotal * (1 - ACCOUNT_DISCOUNT_RATE) + envio)}.{" "}
                <button type="button" className={styles.linkBtn} onClick={() => openAuthModal("login")}>Ingresar</button>
              </p>
            )}
          </aside>
        </div>
      </main>

      {/* Barra fija del celular: total y "Pagar" siempre a mano. */}
      <div className={styles.payBar}>
        {(submitError || (intentoPagar && !puedePagar && !isSubmitting)) && (
          <p className={styles.payBarError} role="alert">
            {submitError || "Revisá los datos marcados antes de pagar."}
          </p>
        )}
        <div className={styles.payBarRow}>
          <span className={styles.payBarTotal}>
            <span className={styles.payBarAmount}>{formatearPrecio(total)}</span>
            <span className={styles.payBarSub}>{esDelivery ? (envio === 0 ? "Envío gratis" : `Incluye envío`) : "Take away"}</span>
          </span>
          <button type="button" className={styles.payBtn} onClick={pagar} disabled={isSubmitting}>
            {isSubmitting ? "Un momento…" : "Pagar con Mercado Pago"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagar;

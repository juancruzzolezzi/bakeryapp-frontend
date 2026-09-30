import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { useCartHandlers } from "../../handlers/cartHandlers";
import style from "./Modal.module.css";
import { validations } from "../../validations/validations";
import { ACCOUNT_DISCOUNT_RATE } from "../../utils/discount";
import { getSavedAddress } from "../../utils/savedAddress";
import { updateQuantity, removeFromCart } from "../../redux/slice/homeSlice";
import {
  DELIVERY_ZONES,
  DELIVERY_FEE,
  FREE_SHIPPING_THRESHOLD,
} from "../../constants/deliveryZones";

Modal.setAppElement("#root");

// Valor del selector de barrio para "no está en la lista": no es una zona
// de cobertura, así que bloquea el pago con delivery (ver isZoneValid).
const OTRA_ZONA = "otra";

const PaymentModal = ({ isOpen, onClose, cartList, totalPrice }) => {
  const user = useSelector((state) => state.authSlice.user);
  const isLoggedIn = Boolean(user);
  const dispatch = useDispatch();

  //Edición del pedido sin salir del modal: mismos reducers que usa el
  //carrito (ver ProductCart.jsx), así que el carrito de atrás y el total
  //de acá se actualizan solos. Si se saca el último producto, no queda
  //nada para pagar: se cierra el modal (y el carrito se cierra solo al
  //quedar vacío, ver Cart.jsx).
  const cambiarCantidad = (product, quantity) => {
    if (quantity < 1 || quantity > 100) return;
    dispatch(updateQuantity({ productId: product.id, quantity }));
  };

  const quitarProducto = (product) => {
    if (cartList.length === 1) onClose();
    dispatch(removeFromCart({ id: product.id }));
  };

  const [contactMethod, setContactMethod] = useState("instagram");
  const [contactValue, setContactValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [deliveryType, setDeliveryType] = useState("delivery");

  //Precarga con la dirección guardada en la cuenta (si está logueado y
  //tiene una) o, si no, con la última usada en este dispositivo: la
  //mayoría de los pedidos van a la misma dirección. Sigue siendo editable
  //por si cambió.
  const [address, setAddress] = useState(
    () => getSavedAddress(user?.id) || localStorage.getItem("lastAddress") || ""
  );
  const [addressTouched, setAddressTouched] = useState(false);
  const direccionRecordada = Boolean(address) && !addressTouched;

  //Barrio de entrega: se elige de la lista de cobertura (en vez de
  //adivinarlo de la dirección escrita), así se sabe ANTES de pagar si
  //llegamos. También se recuerda el último usado en este dispositivo.
  const [deliveryZone, setDeliveryZone] = useState(() => {
    const last = localStorage.getItem("lastZone");
    return DELIVERY_ZONES.includes(last) ? last : "";
  });
  const fueraDeZona = deliveryZone === OTRA_ZONA;

  const { handleSubmitModal, isSubmitting, submitError } = useCartHandlers();

  const { isValidInstagramUsername, isValidWhatsAppNumber, isValidAddress } = validations();

  const isValid =
    contactMethod === "instagram"
      ? isValidInstagramUsername(contactValue)
      : isValidWhatsAppNumber(contactValue);

  const isZoneValid = deliveryType !== "delivery" || DELIVERY_ZONES.includes(deliveryZone);
  const isAddressValid =
    deliveryType !== "delivery" || (isValidAddress(address.trim()) && isZoneValid);

  const envioGratis = totalPrice >= FREE_SHIPPING_THRESHOLD;

  // 10% OFF para cuentas registradas (ver utils/discount.js). El umbral de
  // envío gratis se calcula sobre el subtotal SIN descuento, igual que en
  // el backend (payment.controller.js), que es el que cobra de verdad.
  const discountAmount = isLoggedIn ? totalPrice * ACCOUNT_DISCOUNT_RATE : 0;
  const subtotalConDescuento = totalPrice - discountAmount;

  const finalTotal =
    subtotalConDescuento +
    (deliveryType === "delivery" && !envioGratis ? DELIVERY_FEE : 0);

  const handleMethodChange = (method) => {
    setContactMethod(method);
    setContactValue("");
    setTouched(false);
  };

  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    // Al volver a "delivery" se recupera la dirección guardada/última en
    // vez de dejarlo vacío otra vez (misma prioridad que al abrir el modal).
    setAddress(
      type === "delivery"
        ? getSavedAddress(user?.id) || localStorage.getItem("lastAddress") || ""
        : ""
    );
    setAddressTouched(false);
  };

  const canSubmit = isValid && contactValue !== "" && isAddressValid && !isSubmitting;

  //Indicador de progreso (3 pasos): contacto -> entrega -> listo para
  //pagar, para que el formulario se sienta más guiado.
  const pasoContactoListo = isValid && contactValue !== "";
  const pasoEntregaListo = pasoContactoListo && isAddressValid;
  const pasoFinalListo = canSubmit;

  const submitPayment = () => {
    if (canSubmit) {
      if (deliveryType === "delivery" && address.trim()) {
        localStorage.setItem("lastAddress", address.trim());
        localStorage.setItem("lastZone", deliveryZone);
      }

      handleSubmitModal(
        cartList,
        contactValue,
        contactMethod,
        totalPrice,
        deliveryType,
        deliveryType === "delivery" ? address.trim() : "",
        deliveryType === "delivery" ? deliveryZone : ""
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitPayment();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Ingresar información"
      closeTimeoutMS={200}
      className={{
        base: style.modal,
        afterOpen: style.modalAfterOpen,
        beforeClose: style.modalBeforeClose,
      }}
      overlayClassName={{
        base: style.overlay,
        afterOpen: style.overlayAfterOpen,
        beforeClose: style.overlayBeforeClose,
      }}
      style={{
        overlay: { zIndex: 999999 },
        content: { zIndex: 999999 },
      }}
    >
      <div className={style.modalContent}>
        <h2 className={style.modalHeader}>Ingresa tu información</h2>

        <div className={style.progressTrack} aria-hidden="true">
          <span
            className={`${style.progressDot} ${
              pasoContactoListo ? style.progressDotDone : ""
            }`}
          >
            1
          </span>
          <span
            className={`${style.progressLine} ${
              pasoEntregaListo ? style.progressLineDone : ""
            }`}
          />
          <span
            className={`${style.progressDot} ${
              pasoEntregaListo ? style.progressDotDone : ""
            }`}
          >
            2
          </span>
          <span
            className={`${style.progressLine} ${
              pasoFinalListo ? style.progressLineDone : ""
            }`}
          />
          <span
            className={`${style.progressDot} ${
              pasoFinalListo ? style.progressDotDone : ""
            }`}
          >
            3
          </span>
        </div>
        <p className={style.progressLabel}>
          {!pasoContactoListo
            ? "Paso 1 de 3 — Contacto"
            : !pasoEntregaListo
            ? "Paso 2 de 3 — Cómo lo recibís"
            : "Paso 3 de 3 — Confirmar y pagar"}
        </p>

        <div className={style.orderReview}>
          <p className={style.orderReviewTitle}>Tu pedido</p>
          {cartList.map((product) => (
            <div key={product.id} className={style.orderRow}>
              <span className={style.orderName}>{product.title}</span>
              <div className={style.orderStepper}>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(product, product.quantity - 1)}
                  disabled={product.quantity <= 1}
                  aria-label={`Restar una unidad de ${product.title}`}
                >
                  –
                </button>
                <span>{product.quantity}</span>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(product, product.quantity + 1)}
                  aria-label={`Sumar una unidad de ${product.title}`}
                >
                  +
                </button>
              </div>
              <span className={style.orderPrice}>
                ${(product.price * product.quantity).toLocaleString("es-AR")}
              </span>
              <button
                type="button"
                onClick={() => quitarProducto(product)}
                className={style.orderRemove}
                aria-label={`Quitar ${product.title} del pedido`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={style.modalStep}>
          <span className={style.modalStepNum}>1</span>
          <div className={style.modalStepBody}>
            <p className={style.modalStepTitle}>¿Cómo te contactamos?</p>
            <div className={style.modalContactMethods}>
              <button
                type="button"
                onClick={() => handleMethodChange("instagram")}
                className={`${style.modalMethodBtn} ${
                  contactMethod === "instagram" ? style.modalMethodBtnActive : ""
                }`}
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange("whatsapp")}
                className={`${style.modalMethodBtn} ${
                  contactMethod === "whatsapp" ? style.modalMethodBtnActive : ""
                }`}
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className={style.modalStep}>
          <span className={style.modalStepNum}>2</span>
          <div className={style.modalStepBody}>
            <p className={style.modalStepTitle}>
              {contactMethod === "instagram" ? "Tu usuario de Instagram" : "Tu número de WhatsApp"}
            </p>
            <input
              type="text"
              value={contactValue}
              onChange={(e) => {
                setContactValue(e.target.value);
                setTouched(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={contactMethod === "instagram" ? "@tu_usuario" : "+54 9 11 1234-5678"}
              className={style.modalInput}
            />
            <span className={style.modalHint}>
              {contactMethod === "instagram"
                ? "Tiene que empezar con @, por ejemplo: @juanperez"
                : "Incluí el código de país, ej: +5491112345678"}
            </span>

            {touched && !isValid && (
              <span className={style.modalError}>
                {contactMethod === "instagram"
                  ? "Usuario de Instagram no válido"
                  : "Número de WhatsApp no válido"}
              </span>
            )}
          </div>
        </div>

        <div className={style.modalStep}>
          <span className={style.modalStepNum}>3</span>
          <div className={style.modalStepBody}>
            <p className={style.modalStepTitle}>¿Cómo lo recibís?</p>
            <div className={style.modalContactMethods}>
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange("delivery")}
                className={`${style.modalMethodBtn} ${
                  deliveryType === "delivery" ? style.modalMethodBtnActive : ""
                }`}
              >
                Delivery
              </button>
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange("takeaway")}
                className={`${style.modalMethodBtn} ${
                  deliveryType === "takeaway" ? style.modalMethodBtnActive : ""
                }`}
              >
                Take Away
              </button>
            </div>

            {deliveryType === "delivery" && (
              <>
                <label
                  className={style.modalLabel}
                  style={{ marginTop: "0.9rem" }}
                  htmlFor="payment-zone"
                >
                  Barrio:
                </label>
                <select
                  id="payment-zone"
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  className={style.modalInput}
                >
                  <option value="" disabled>
                    Elegí tu barrio
                  </option>
                  {DELIVERY_ZONES.map((zona) => (
                    <option key={zona} value={zona}>
                      {zona}
                    </option>
                  ))}
                  <option value={OTRA_ZONA}>Otro barrio</option>
                </select>
                {fueraDeZona && (
                  <div className={style.zoneWarning}>
                    <span>
                      Todavía no hacemos delivery a tu zona. Podés retirar tu
                      pedido en el local sin costo.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeliveryTypeChange("takeaway")}
                      className={style.zoneWarningBtn}
                    >
                      Cambiar a Take Away
                    </button>
                  </div>
                )}

                <label className={style.modalLabel} htmlFor="payment-address">
                  Dirección de entrega:
                </label>
                <input
                  id="payment-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressTouched(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Calle y número (piso/depto y barrio opcional)"
                  className={style.modalInput}
                />
                {direccionRecordada && (
                  <span className={style.modalHintOk}>
                    {isLoggedIn && getSavedAddress(user.id)
                      ? "✓ Autocompletada con tu dirección guardada"
                      : "✓ Autocompletada con tu última dirección"}
                  </span>
                )}
                <span className={style.modalHint}>
                  Tiene que incluir calle y altura, ej: Zavalía 2026
                </span>
                {addressTouched && !isValidAddress(address.trim()) && (
                  <span className={style.modalError}>
                    Ingresá una dirección válida con calle y número
                  </span>
                )}
                <span className={style.modalHintSpaced}>
                  {envioGratis
                    ? "¡Envío gratis por superar el mínimo!"
                    : `El delivery tiene un costo adicional de $${DELIVERY_FEE.toLocaleString("es-AR")}`}
                </span>
              </>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <div className={style.modalHintOk}>
            🎉 Descuento por tu cuenta (10%): -${discountAmount.toLocaleString("es-AR")}
          </div>
        )}

        <div className={style.modalTotalBox}>
          <span>Total a pagar</span>
          <span>${finalTotal.toLocaleString("es-AR")}</span>
        </div>

        {submitError && <span className={style.modalError}>{submitError}</span>}
        <button
          onClick={submitPayment}
          disabled={!canSubmit}
          className={style.modalBtn}
        >
          {isSubmitting ? "Procesando..." : "Continuar al pago"}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;

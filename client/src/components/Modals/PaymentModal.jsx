import React, { useState } from "react";
import Modal from "react-modal";
import { useCartHandlers } from "../../handlers/cartHandlers";
import style from "./Modal.module.css";
import { validations } from "../../validations/validations";

Modal.setAppElement("#root");

// Costo fijo de envío a domicilio. Tiene que coincidir con DELIVERY_FEE en
// api/mercadoPago/src/controllers/payment.controller.js (ahí es donde se
// cobra de verdad; acá solo se usa para mostrarle el total al usuario antes de pagar).
const DELIVERY_FEE = 2000;

// A partir de este monto (sin contar el envío) el delivery sale gratis.
// Tiene que coincidir con FREE_SHIPPING_THRESHOLD en Cart.jsx (la barra de
// progreso) y en payment.controller.js (ahí es donde se cobra de verdad).
const FREE_SHIPPING_THRESHOLD = 15000;

const PaymentModal = ({ isOpen, onClose, cartList, totalPrice }) => {
  const [contactMethod, setContactMethod] = useState("instagram");
  const [contactValue, setContactValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [deliveryType, setDeliveryType] = useState("delivery");

  //Precarga con la última dirección usada (si hay), en vez de arrancar
  //siempre vacío: la mayoría de los pedidos van a la misma dirección. Sigue
  //siendo editable por si cambió.
  const [address, setAddress] = useState(
    () => localStorage.getItem("lastAddress") || ""
  );
  const [addressTouched, setAddressTouched] = useState(false);
  const direccionRecordada = Boolean(address) && !addressTouched;

  const { handleSubmitModal, isSubmitting, submitError } = useCartHandlers();

  const { isValidInstagramUsername, isValidWhatsAppNumber, isValidAddress } = validations();

  const isValid =
    contactMethod === "instagram"
      ? isValidInstagramUsername(contactValue)
      : isValidWhatsAppNumber(contactValue);

  const isAddressValid = deliveryType !== "delivery" || isValidAddress(address.trim());

  const envioGratis = totalPrice >= FREE_SHIPPING_THRESHOLD;

  const finalTotal =
    totalPrice + (deliveryType === "delivery" && !envioGratis ? DELIVERY_FEE : 0);

  const handleMethodChange = (method) => {
    setContactMethod(method);
    setContactValue("");
    setTouched(false);
  };

  const handleDeliveryTypeChange = (type) => {
    setDeliveryType(type);
    // Al volver a "delivery" se recupera la última dirección guardada en
    // vez de dejarlo vacío otra vez.
    setAddress(type === "delivery" ? localStorage.getItem("lastAddress") || "" : "");
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
      }

      handleSubmitModal(
        cartList,
        contactValue,
        contactMethod,
        totalPrice,
        deliveryType,
        deliveryType === "delivery" ? address.trim() : ""
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
                <label className={style.modalLabel} style={{ marginTop: "0.9rem" }}>
                  Dirección de entrega:
                </label>
                <input
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
                    ✓ Autocompletada con tu última dirección
                  </span>
                )}
                <span className={style.modalHint}>
                  Tiene que incluir calle y altura, ej: Zavalía 2026
                </span>
                {addressTouched && !isAddressValid && (
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

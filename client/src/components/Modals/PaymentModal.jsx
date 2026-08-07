import React, { useState } from "react";
import Modal from "react-modal";
import { useCartHandlers } from "../../handlers/cartHandlers";
import style from "./Modal.module.css";
import { validations } from "../../validations/validations";

Modal.setAppElement("#root");

const PaymentModal = ({ isOpen, onClose, cartList, totalPrice }) => {
  const [contactMethod, setContactMethod] = useState("instagram");
  const [contactValue, setContactValue] = useState("");
  const [touched, setTouched] = useState(false);

  const { handleSubmitModal, isSubmitting, submitError } = useCartHandlers();

  const { isValidInstagramUsername, isValidWhatsAppNumber } = validations();

  const isValid =
    contactMethod === "instagram"
      ? isValidInstagramUsername(contactValue)
      : isValidWhatsAppNumber(contactValue);

  const handleMethodChange = (method) => {
    setContactMethod(method);
    setContactValue("");
    setTouched(false);
  };

  const canSubmit = isValid && contactValue !== "" && !isSubmitting;

  const submitPayment = () => {
    if (canSubmit) {
      handleSubmitModal(cartList, contactValue, contactMethod, totalPrice);
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
      className={style.modal}
      overlayClassName={style.overlay}
      style={{
        overlay: { zIndex: 999999 },
        content: { zIndex: 999999 },
      }}
    >
      <div className={style.modalContent}>
        <h2 className={style.modalHeader}>Ingresa tu información</h2>
        <p className={style.modalText}>
          ¿Cómo preferís que te contactemos para coordinar tu pedido?
        </p>

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

        <label className={style.modalLabel}>
          {contactMethod === "instagram" ? "Usuario de Instagram:" : "Número de WhatsApp:"}
        </label>
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
        {submitError && <span className={style.modalError}>{submitError}</span>}
        <br />
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

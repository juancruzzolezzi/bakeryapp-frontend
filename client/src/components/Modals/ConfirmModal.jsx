import React from "react";
import Modal from "react-modal";
import style from "./ConfirmModal.module.css";

Modal.setAppElement("#root");

// Confirmación de algo que no se puede deshacer dentro del carrito
// (vaciarlo, sacar un producto). Mismo estilo claro que "Tu pedido":
// tarjeta centrada en escritorio y hoja desde abajo en el celular.
const ConfirmModal = ({ isOpen, onCancel, onConfirm, title, text, confirmLabel }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onCancel}
        contentLabel={title}
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
        <span className={style.grabber} aria-hidden="true" />
        <span className={style.icon} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
            </svg>
        </span>
        <h2 className={style.title}>{title}</h2>
        <p className={style.text}>{text}</p>
        <div className={style.actions}>
            <button type="button" onClick={onConfirm} className={style.confirmBtn}>
                {confirmLabel}
            </button>
            <button type="button" onClick={onCancel} className={style.cancelBtn}>
                Cancelar
            </button>
        </div>
    </Modal>
);

export default ConfirmModal;

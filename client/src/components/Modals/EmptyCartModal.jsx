import React from "react";
import Modal from "react-modal";
import style from "./Modal.module.css";

Modal.setAppElement("#root");

const EmptyCartModal = ({ isOpen, onCancel, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            contentLabel="Vaciar carrito"
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
                <div className={style.modalConfirmIcon}>🗑️</div>
                <h2 className={style.modalHeader}>Vaciar carrito</h2>
                <p className={style.modalText}>
                    ¿Estás seguro que querés vaciar el carrito? Esta acción no
                    se puede deshacer.
                </p>
                <div className={style.modalConfirmActions}>
                    <button onClick={onConfirm} className={style.modalBtnDanger}>
                        Vaciar carrito
                    </button>
                    <button onClick={onCancel} className={style.modalBtnNeutral}>
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EmptyCartModal;

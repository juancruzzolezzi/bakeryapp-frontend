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
            className={style.modal}
            overlayClassName={style.overlay}
            style={{
                overlay: { zIndex: 999999 },
                content: { zIndex: 999999 },
            }}
        >
            <div className={style.modalContent}>
                <h2 className={style.modalHeader}>Vaciar carrito</h2>
                <p className={style.modalText}>
                    ¿Estás seguro que querés vaciar el carrito?
                </p>
                <button onClick={onCancel} className={style.modalBtn}>
                    Cancelar
                </button>
                <button onClick={onConfirm} className={style.modalBtn}>
                    Sí
                </button>
            </div>
        </Modal>
    );
};

export default EmptyCartModal;

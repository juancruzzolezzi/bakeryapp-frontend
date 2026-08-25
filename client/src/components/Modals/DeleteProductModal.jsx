import React from "react";
import Modal from "react-modal";
import style from "./Modal.module.css";

Modal.setAppElement("#root");

const DeleteProductModal = ({ isOpen, onCancel, onConfirm }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onCancel}
        contentLabel="Eliminar producto"
        className={style.modal}
        overlayClassName={style.overlay}
        style={{
          overlay: { zIndex: 999999 },
          content: { zIndex: 999999 },
        }}
      >
        <div className={style.modalContent}>
          <div className={style.modalConfirmIcon}>🗑️</div>
          <h2 className={style.modalHeader}>Eliminar producto</h2>
          <p className={style.modalText}>
            Vas a eliminar este producto de tu carrito. ¿Estás seguro?
          </p>
          <div className={style.modalConfirmActions}>
            <button onClick={onConfirm} className={style.modalBtnDanger}>
              Eliminar
            </button>
            <button onClick={onCancel} className={style.modalBtnNeutral}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    );
};

export default DeleteProductModal;

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
          <h5 className={style.modalHeader}>
            Vas a eliminar el producto de tu carrito.
          </h5>
          <p className={style.modalText}>
            ¿Estás seguro?
          </p>
          <button onClick={onCancel} className={style.modalBtnNeutral}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={style.modalBtnDanger}>
            Sí
          </button>
        </div>
      </Modal>
    );
};

export default DeleteProductModal;

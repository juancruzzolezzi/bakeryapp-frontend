import React from "react";
import Modal from "react-modal";
import style from "./Modal.module.css";

Modal.setAppElement("#root");

const DeleteProductModal = ({ isOpen, onCancel, onConfirm }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onCancel}
        contentLabel="Delete Product"
        className={style.modal}
      >
        <div className={style.modalContent}>
          <h5 className={style.modalHeader}>
            You are about to delete the product from your Cart.
          </h5>
          <p className={style.modalText}>
            Are you sure?
          </p>
          <button onClick={onCancel} className={style.modalBtn}>
            Cancel
          </button>
          <button onClick={onConfirm} className={style.modalBtn}>
            Yes
          </button>
        </div>
      </Modal>
    );
};

export default DeleteProductModal;

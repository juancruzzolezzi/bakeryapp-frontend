import React from "react";
import Modal from "react-modal";
import style from "./Modal.module.css";

Modal.setAppElement("#root");

const EmptyCartModal = ({ isOpen, onCancel, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            contentLabel="Empty Cart"
            className={style.modal}
        >
            <div className={style.modalContent}>
                <h2 className={style.modalHeader}>Empty Cart</h2>
                <p className={style.modalText}>
                    Are you sure you want to empty your cart?
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

export default EmptyCartModal;

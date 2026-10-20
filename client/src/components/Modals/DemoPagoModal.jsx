import React from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import style from "./ConfirmModal.module.css";

Modal.setAppElement("#root");

// Lo que ve quien toca "Pagar" con el modo demo activo (ver
// constants/demo.js): en vez de ir a Mercado Pago, se explica que la
// tienda es ficticia. Mismo estilo que ConfirmModal.
const DemoPagoModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Tienda de demostración"
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
            <span className={style.icon} aria-hidden="true">🎓</span>
            <h2 className={style.title}>Esto es una demo</h2>
            <p className={style.text}>
                Bakery es un proyecto académico: la tienda es ficticia, así que no se
                cobra nada ni se prepara ningún pedido. ¡Gracias por probarla!
            </p>
            <div className={style.actions}>
                <button type="button" onClick={onClose} className={style.confirmBtn}>
                    Entendido
                </button>
                <button type="button" onClick={() => navigate("/products")} className={style.cancelBtn}>
                    Volver a la tienda
                </button>
            </div>
        </Modal>
    );
};

export default DemoPagoModal;

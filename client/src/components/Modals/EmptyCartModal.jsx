import React from "react";
import ConfirmModal from "./ConfirmModal";

const EmptyCartModal = ({ isOpen, onCancel, onConfirm }) => (
    <ConfirmModal
        isOpen={isOpen}
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="¿Vaciar tu pedido?"
        text="Vas a sacar todo lo que agregaste. No se puede deshacer."
        confirmLabel="Sí, vaciar"
    />
);

export default EmptyCartModal;

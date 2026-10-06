import React from "react";
import ConfirmModal from "./ConfirmModal";

const DeleteProductModal = ({ isOpen, onCancel, onConfirm, productTitle }) => (
    <ConfirmModal
        isOpen={isOpen}
        onCancel={onCancel}
        onConfirm={onConfirm}
        title={productTitle ? `¿Sacar ${productTitle}?` : "¿Sacar este producto?"}
        text="Lo sacamos de tu pedido. Si cambiás de idea, lo volvés a agregar desde el catálogo."
        confirmLabel="Sacar"
    />
);

export default DeleteProductModal;

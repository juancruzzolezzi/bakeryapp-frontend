// Dirección de entrega guardada en la cuenta (no solo "la última usada",
// ver PaymentModal.jsx/lastAddress): vive en localStorage bajo una clave
// propia por usuario, para que cada cuenta tenga la suya en este
// dispositivo y no se pisen entre sí si se comparte el navegador.
const KEY_PREFIX = "savedAddress_";

export const getSavedAddress = (userId) => {
    if (!userId) return "";
    try {
        return localStorage.getItem(KEY_PREFIX + userId) || "";
    } catch {
        return "";
    }
};

export const setSavedAddress = (userId, address) => {
    if (!userId) return;
    try {
        if (address) {
            localStorage.setItem(KEY_PREFIX + userId, address);
        } else {
            localStorage.removeItem(KEY_PREFIX + userId);
        }
    } catch {
        // localStorage no disponible: no hay respaldo, simplemente no se guarda.
    }
};

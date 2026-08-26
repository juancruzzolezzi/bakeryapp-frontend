import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../redux/slice/authSlice";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import { isStandalone } from "../../utils/pwa";
import { getSavedAddress, setSavedAddress } from "../../utils/savedAddress";
import modalStyle from "../Modals/Modal.module.css";
import style from "./AccountButton.module.css";

Modal.setAppElement("#root");

const AccountButton = () => {
    const user = useSelector((state) => state.authSlice.user);
    const dispatch = useDispatch();
    const openAuthModal = useAuthModal();
    const showToast = useToast();
    const navigate = useNavigate();

    //Antes esto era un cartel flotante posicionado a mano (position: fixed
    //+ coordenadas calculadas con JS): un modal de verdad (mismo mecanismo
    //que AuthModal/PaymentModal/Cart, ya probado en el resto del sitio) es
    //mucho más confiable que reinventar ese posicionamiento — ver historial
    //de intentos previos que no terminaban de andar en todos los casos.
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState("");

    //Precarga el campo de dirección con la que ya tenga guardada esta
    //cuenta cada vez que se abre el modal.
    useEffect(() => {
        if (isOpen && user) {
            setAddress(getSavedAddress(user.id));
        }
    }, [isOpen, user]);

    // Registrarse/iniciar sesión (y el 10% OFF que viene con la cuenta) es
    // una función solo de la app instalada, no de la web normal.
    if (!isStandalone()) return null;

    const handleClick = () => {
        if (user) {
            setIsOpen(true);
        } else {
            openAuthModal("login");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        showToast("Sesión cerrada", "👋");
        setIsOpen(false);
        navigate("/");
    };

    const handleSaveAddress = () => {
        setSavedAddress(user.id, address.trim());
        showToast(address.trim() ? "Dirección guardada" : "Dirección borrada", "📍");
    };

    return (
        <div className={style.wrapper}>
            <button
                type="button"
                onClick={handleClick}
                className={style.accountBtn}
                data-account-toggle="true"
                title={user ? user.username : "Ingresar o crear cuenta"}
            >
                <FontAwesomeIcon icon={faUser} />
                <span className={style.label}>{user ? user.username : "Ingresar"}</span>
            </button>

            {user && (
                <Modal
                    isOpen={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                    contentLabel="Tu cuenta"
                    closeTimeoutMS={200}
                    className={{
                        base: modalStyle.modal,
                        afterOpen: modalStyle.modalAfterOpen,
                        beforeClose: modalStyle.modalBeforeClose,
                    }}
                    overlayClassName={{
                        base: modalStyle.overlay,
                        afterOpen: modalStyle.overlayAfterOpen,
                        beforeClose: modalStyle.overlayBeforeClose,
                    }}
                    style={{
                        overlay: { zIndex: 999999 },
                        content: { zIndex: 999999 },
                    }}
                >
                    <div className={modalStyle.modalContent}>
                        <h2 className={modalStyle.modalHeader}>¡Hola, {user.username}!</h2>
                        <p className={style.panelEmail}>{user.email}</p>

                        <label className={modalStyle.modalLabel} style={{ marginTop: "0.9rem" }}>
                            Dirección de entrega
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Calle y número, barrio"
                            className={modalStyle.modalInput}
                        />
                        <button
                            type="button"
                            onClick={handleSaveAddress}
                            className={style.panelSaveBtn}
                        >
                            Guardar dirección
                        </button>
                        <p className={style.panelHint}>
                            Se va a sugerir sola la próxima vez que hagas un pedido.
                        </p>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className={style.panelLogoutBtn}
                        >
                            Cerrar sesión
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={style.panelCloseBtn}
                        >
                            Cerrar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AccountButton;

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../redux/slice/authSlice";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import { isStandalone } from "../../utils/pwa";
import { getSavedAddress, setSavedAddress } from "../../utils/savedAddress";
import style from "./AccountButton.module.css";

const AccountButton = () => {
    const user = useSelector((state) => state.authSlice.user);
    const dispatch = useDispatch();
    const openAuthModal = useAuthModal();
    const showToast = useToast();

    //Mini cartel con el nombre + cerrar sesión (en vez de cerrar sesión de
    //golpe al tocar el botón de nuevo, ver handleClick más abajo).
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState("");
    const panelRef = useRef(null);

    //Precarga el campo de dirección con la que ya tenga guardada esta
    //cuenta cada vez que se abre el cartel.
    useEffect(() => {
        if (isOpen && user) {
            setAddress(getSavedAddress(user.id));
        }
    }, [isOpen, user]);

    //Cierra el cartel al hacer click afuera, misma lógica de siempre
    //(Cart.jsx, NavBarHome.jsx).
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (panelRef.current && panelRef.current.contains(event.target)) return;
            if (event.target.closest("[data-account-toggle]")) return;
            setIsOpen(false);
        };

        document.addEventListener("click", handleClickOutside, true);
        return () => document.removeEventListener("click", handleClickOutside, true);
    }, [isOpen]);

    // Registrarse/iniciar sesión (y el 10% OFF que viene con la cuenta) es
    // una función solo de la app instalada, no de la web normal.
    if (!isStandalone()) return null;

    const handleClick = () => {
        if (user) {
            //Ya no cierra sesión directo: solo abre/cierra el mini cartel
            //con el nombre y el botón de cerrar sesión.
            setIsOpen((v) => !v);
        } else {
            openAuthModal("login");
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        showToast("Sesión cerrada", "👋");
        setIsOpen(false);
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

            {isOpen && user && (
                <div ref={panelRef} className={style.panel}>
                    <p className={style.panelName}>¡Hola, {user.username}!</p>
                    <p className={style.panelEmail}>{user.email}</p>

                    <label className={style.panelLabel}>Dirección de entrega</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Calle y número, barrio"
                        className={style.panelInput}
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
                </div>
            )}
        </div>
    );
};

export default AccountButton;

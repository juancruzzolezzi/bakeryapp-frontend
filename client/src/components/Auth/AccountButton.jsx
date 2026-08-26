import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { logout } from "../../redux/slice/authSlice";
import { useAuthModal } from "../../context/AuthModalContext";
import { useToast } from "../../context/ToastContext";
import { isStandalone } from "../../utils/pwa";
import style from "./AccountButton.module.css";

const AccountButton = () => {
    const user = useSelector((state) => state.authSlice.user);
    const dispatch = useDispatch();
    const openAuthModal = useAuthModal();
    const showToast = useToast();

    // Registrarse/iniciar sesión (y el 10% OFF que viene con la cuenta) es
    // una función solo de la app instalada, no de la web normal.
    if (!isStandalone()) return null;

    const handleClick = () => {
        if (user) {
            dispatch(logout());
            showToast("Sesión cerrada", "👋");
        } else {
            openAuthModal("login");
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={style.accountBtn}
            title={user ? "Cerrar sesión" : "Ingresar o crear cuenta"}
        >
            <FontAwesomeIcon icon={faUser} />
            <span className={style.label}>{user ? user.username : "Ingresar"}</span>
        </button>
    );
};

export default AccountButton;

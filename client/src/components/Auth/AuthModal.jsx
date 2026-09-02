import React, { useCallback, useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
    useGoogleLoginMutation,
    useLoginUserMutation,
    useRegisterUserMutation,
} from "../../api/appApi";
import { setCredentials } from "../../redux/slice/authSlice";
import { useToast } from "../../context/ToastContext";
import GoogleButton from "./GoogleButton";
import style from "../Modals/Modal.module.css";

Modal.setAppElement("#root");

// Guarda el email y la contraseña en este dispositivo cuando el usuario
// tilda "Recordarme", para no tener que tipearlos de nuevo la próxima vez.
// Queda en localStorage sin cifrar (como el autocompletado del propio
// navegador): es cómodo, pero solo tiene sentido en un dispositivo propio.
const REMEMBER_KEY = "rememberedAuth";

const AuthModal = ({ isOpen, initialTab, onClose }) => {
    const [tab, setTab] = useState(initialTab || "login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();
    const [registerUser, { isLoading: registerLoading }] = useRegisterUserMutation();
    const [googleLogin, { isLoading: googleLoading }] = useGoogleLoginMutation();
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const showToast = useToast();

    // Ingreso con Google: recibimos el "credential" del botón de Google, lo
    // canjeamos en el backend por nuestro token y cerramos el modal.
    const handleGoogleCredential = useCallback(
        async (credential) => {
            setError("");
            try {
                const result = await googleLogin({ credential }).unwrap();
                dispatch(setCredentials(result));
                showToast(`¡Hola, ${result.user.username}!`, "👋");
                onClose();
            } catch (err) {
                setError(err?.data?.error || "No se pudo ingresar con Google.");
            }
        },
        [googleLogin, dispatch, showToast, onClose]
    );

    //Al abrirse, siempre arranca en la pestaña que pidieron (login o
    //registro). Si hay credenciales recordadas, precarga el formulario con
    //ellas (y tilda "Recordarme"); si no, arranca limpio.
    useEffect(() => {
        if (isOpen) {
            setTab(initialTab || "login");
            setConfirmPassword("");
            setShowPassword(false);
            setShowConfirmPassword(false);
            setError("");

            let remembered = null;
            try {
                remembered = JSON.parse(localStorage.getItem(REMEMBER_KEY));
            } catch {
                remembered = null;
            }

            if (remembered?.email) {
                setEmail(remembered.email);
                setPassword(remembered.password || "");
                setRememberMe(true);
            } else {
                setEmail("");
                setPassword("");
                setRememberMe(false);
            }
            setUsername("");
        }
    }, [isOpen, initialTab]);

    const isLoading = loginLoading || registerLoading || googleLoading;
    const passwordsMatch = tab !== "register" || password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordsMatch) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            const result =
                tab === "login"
                    ? await loginUser({ email, password }).unwrap()
                    : await registerUser({ email, username, password }).unwrap();

            dispatch(setCredentials(result));

            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            showToast(
                tab === "login"
                    ? `¡Hola de nuevo, ${result.user.username}!`
                    : "¡Cuenta creada! Ya tenés 10% OFF en toda la tienda.",
                tab === "login" ? "👋" : "🎉"
            );
            onClose();
        } catch (err) {
            setError(err?.data?.error || "Algo salió mal. Probá de nuevo.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={tab === "login" ? "Ingresar" : "Crear cuenta"}
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
            <div className={style.modalContent}>
                <h2 className={style.modalHeader}>
                    {tab === "login" ? "Ingresá a tu cuenta" : "Creá tu cuenta"}
                </h2>

                <div className={style.modalContactMethods}>
                    <button
                        type="button"
                        onClick={() => setTab("login")}
                        className={`${style.modalMethodBtn} ${
                            tab === "login" ? style.modalMethodBtnActive : ""
                        }`}
                    >
                        Ingresar
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("register")}
                        className={`${style.modalMethodBtn} ${
                            tab === "register" ? style.modalMethodBtnActive : ""
                        }`}
                    >
                        Registrarme
                    </button>
                </div>

                {tab === "register" && (
                    <p className={style.modalHintOk} style={{ marginTop: "0.9rem" }}>
                        🎉 Registrate y tené 10% OFF en toda la tienda, en cada compra.
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    {tab === "register" && (
                        <>
                            <label className={style.modalLabel} style={{ marginTop: "0.9rem" }}>
                                Tu nombre
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Cómo te llamamos"
                                className={style.modalInput}
                                required
                            />
                        </>
                    )}

                    <label className={style.modalLabel} style={{ marginTop: "0.9rem" }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className={style.modalInput}
                        required
                    />

                    <label className={style.modalLabel} style={{ marginTop: "0.9rem" }}>
                        Contraseña
                    </label>
                    <div className={style.modalPasswordField}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tab === "register" ? "Al menos 6 caracteres" : "Tu contraseña"}
                            className={style.modalInput}
                            required
                            minLength={tab === "register" ? 6 : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className={style.modalPasswordToggle}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    {tab === "register" && (
                        <>
                            <label className={style.modalLabel} style={{ marginTop: "0.9rem" }}>
                                Confirmar contraseña
                            </label>
                            <div className={style.modalPasswordField}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repetí la contraseña"
                                    className={style.modalInput}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className={style.modalPasswordToggle}
                                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {!passwordsMatch && confirmPassword !== "" && (
                                <span className={style.modalError}>Las contraseñas no coinciden</span>
                            )}
                        </>
                    )}

                    <label className={style.modalCheckboxLabel}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Recordar mi email y contraseña en este dispositivo
                    </label>

                    {error && (
                        <span className={style.modalError} style={{ marginTop: "0.6rem" }}>
                            {error}
                        </span>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !passwordsMatch}
                        className={style.modalBtn}
                    >
                        {isLoading
                            ? "Un momento..."
                            : tab === "login"
                            ? "Ingresar"
                            : "Crear cuenta"}
                    </button>
                </form>

                <GoogleButton
                    onCredential={handleGoogleCredential}
                    onError={(msg) => setError(msg)}
                />
            </div>
        </Modal>
    );
};

export default AuthModal;

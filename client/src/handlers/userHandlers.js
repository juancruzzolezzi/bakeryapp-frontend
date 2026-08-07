import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setUser, setIdToken, setUserName, clearUser } from "../redux/slice/authSlice";
import { validations } from "../validations/validations";
import { base_URL } from "../api/base_URL";

export const useUserHandlers = (
    setEmailError,
    setPasswordError,
    setUsernameError,
    setRegistrationError
) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isEmailValid, isPasswordValid, isUsernameValid } = validations();

    const handleLogIn = async (email, password, setError) => {
        try {
            const response = await fetch(`${base_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                switch (data.code) {
                    case "auth/wrong-password":
                        setError("Contraseña incorrecta. Intentá de nuevo.");
                        break;
                    case "auth/user-not-found":
                        setError(
                            "No existe un usuario con ese email o nombre de usuario. Verificalo o registrate."
                        );
                        break;
                    default:
                        setError("Ocurrió un error. Revisá el email/usuario y la contraseña.");
                        break;
                }
                return;
            }

            dispatch(setUser(data.email));
            dispatch(setUserName(data.username));
            dispatch(setIdToken(data.token));
            localStorage.setItem("userEmail", data.email);
            navigate("/");
        } catch (error) {
            console.log("Error al iniciar sesión: ", error);
            setError("Ocurrió un error. Intentá de nuevo.");
        }
    };

    const handleRegister = async (
        event,
        email,
        username,
        password,
        confirmPassword
    ) => {
        event.preventDefault();
        setEmailError("");
        setPasswordError("");
        setUsernameError("");
        setRegistrationError("");

        if (!isEmailValid(email)) {
            setEmailError("Correo electrónico inválido");
            return;
        }

        if (!isUsernameValid(username)) {
            setUsernameError("El nombre de usuario debe tener al menos 4 caracteres");
            return;
        }

        if (!isPasswordValid(password)) {
            setPasswordError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch(`${base_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === "auth/email-already-in-use") {
                    setRegistrationError("Ese email ya está en uso.");
                } else {
                    setRegistrationError("Ocurrió un error. Intentá de nuevo.");
                }
                return;
            }

            dispatch(setUser(data.email));
            dispatch(setUserName(data.username));
            dispatch(setIdToken(data.token));
            localStorage.setItem("userEmail", data.email);
            navigate("/");
        } catch (error) {
            console.log("Error al registrar: ", error);
            setRegistrationError("Ocurrió un error. Intentá de nuevo.");
        }
    };

    const handleLogOut = async () => {
        dispatch(clearUser());
        localStorage.removeItem("userEmail");
        navigate("/login");
    };

    return {
        handleLogIn,
        handleRegister,
        handleLogOut
    };
};

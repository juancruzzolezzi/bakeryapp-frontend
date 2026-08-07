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
                        setError("Incorrect password. Please try again.");
                        break;
                    case "auth/user-not-found":
                        setError(
                            "No user found with this email. Please check the email or register."
                        );
                        break;
                    default:
                        setError("An error occurred. Maybe the password or email is incorrect.");
                        break;
                }
                return;
            }

            dispatch(setUser(data.email));
            dispatch(setUserName(data.username));
            dispatch(setIdToken(data.token));
            localStorage.setItem("userEmail", email);
            navigate("/");
        } catch (error) {
            console.log("Error al iniciar sesión: ", error);
            setError("An error occurred. Please try again.");
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
                    setRegistrationError("This email is already in use.");
                } else {
                    setRegistrationError("An error occurred. Please try again.");
                }
                return;
            }

            dispatch(setUser(data.email));
            dispatch(setUserName(data.username));
            dispatch(setIdToken(data.token));
            localStorage.setItem("userEmail", email);
            navigate("/");
        } catch (error) {
            console.log("Error al registrar: ", error);
            setRegistrationError("An error occurred. Please try again.");
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

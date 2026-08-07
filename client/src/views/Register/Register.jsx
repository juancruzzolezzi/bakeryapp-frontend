import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserHandlers } from "../../handlers/userHandlers";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import styles from "./Register.module.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [registrationError, setRegistrationError] = useState("");

    const { handleRegister } = useUserHandlers(
        setEmailError,
        setPasswordError,
        setUsernameError,
        setRegistrationError
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        await handleRegister(event, email, username, password, confirmPassword);
    };
    
    return (
      <div className={styles.container}>
        <NavBarHome />
        <h2 className={styles.title}>Registrate</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            {emailError && <p>{emailError}</p>}
          </div>
          <div className={styles.field}>
            <label htmlFor="username">Nombre de usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            {usernameError && <p>{usernameError}</p>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            {passwordError && <p>{passwordError}</p>}
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            Registrarse
          </button>
          <Link to="/login" className={styles.link}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </form>
        {registrationError && (
          <p className={styles.error}>{registrationError}</p>
        )}
      </div>
    );
};

export default Register;
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useUserHandlers } from "../../handlers/userHandlers";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import styles from "./LogIn.module.css";

const LogIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const { handleLogIn } = useUserHandlers();

    const handleSignIn = () => {
        handleLogIn(email, password, setError);
    };
    
    return (
      <div className={styles.logInContainer}>
        <NavBarHome />
        <div className={styles.titleDiv}>
          <h3>Log In</h3>
        </div>
        <div className={styles.inputContainer}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleSignIn} className={`${styles.button} ${styles.signInButton}`}>
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className={`${styles.button} ${styles.registerButton}`}
          >
            You don't have an account? Register
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
};

export default LogIn;
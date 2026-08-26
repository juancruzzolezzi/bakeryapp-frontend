import React, { createContext, useCallback, useContext, useState } from "react";
import AuthModal from "../components/Auth/AuthModal";

const AuthModalContext = createContext(null);

// Permite abrir el modal de login/registro desde cualquier componente
// (NavBar, NavBarHome, el banner de instalar la app, etc.) sin tener que
// pasar el estado a mano por cada uno.
export const AuthModalProvider = ({ children }) => {
    const [state, setState] = useState({ open: false, tab: "login" });

    const openAuthModal = useCallback((tab = "login") => {
        setState({ open: true, tab });
    }, []);

    const closeAuthModal = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
    }, []);

    return (
        <AuthModalContext.Provider value={openAuthModal}>
            {children}
            <AuthModal isOpen={state.open} initialTab={state.tab} onClose={closeAuthModal} />
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error("useAuthModal debe usarse dentro de <AuthModalProvider>");
    }
    return context;
};

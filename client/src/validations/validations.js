export const validations = () => {
    //Valida que el @usuario de instagram cumpla con el formato
    const isValidInstagramUsername = (username) => {
        const instagramUsernameRegex =
            /^@[a-zA-Z0-9][a-zA-Z0-9._]{0,28}[a-zA-Z0-9]$/;
        return instagramUsernameRegex.test(username);
    };

    //Valida que el correo electronico cumpla con el formato
    const isEmailValid = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    //Valida que el nombre de usuario de ChiniBakery contenga al menos 4 caracteres
    const isUsernameValid = (username) => {
        return username.length >= 4;
    };

    //Valida que la contraseña de ChiniBakery contenga al menos 6 caracteres
    const isPasswordValid = (password) => {
        return password.length >= 6;
    };

    //Devuelve todos los handlers para poder utilizarlos en componentes React
    return {
        isEmailValid,
        isPasswordValid,
        isUsernameValid,
        isValidInstagramUsername,
    };
};

// Calcula si el local está abierto AHORA según horarioAtencion (ver
// constants/contacto.js), en vez de tener que actualizar un texto fijo a
// mano cada vez.
export const estaAbiertoAhora = (horarioAtencion, ahora = new Date()) => {
    const { dias, abre, cierra } = horarioAtencion;
    const dia = ahora.getDay();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;

    return dias.includes(dia) && hora >= abre && hora < cierra;
};

// Nombres según getDay() (0 = domingo).
export const NOMBRES_DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Texto corto para acompañar el "Abierto/Cerrado ahora": cuándo cierra, o
// cuándo vuelve a abrir ("hoy", "mañana" o el nombre del día).
export const detalleHorario = (horarioAtencion, ahora = new Date()) => {
    const { dias, abre, cierra } = horarioAtencion;
    if (estaAbiertoAhora(horarioAtencion, ahora)) {
        return `cierra a las ${cierra} hs`;
    }

    const hoy = ahora.getDay();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;
    if (dias.includes(hoy) && hora < abre) {
        return `abre hoy a las ${abre} hs`;
    }

    for (let i = 1; i <= 7; i++) {
        const dia = (hoy + i) % 7;
        if (dias.includes(dia)) {
            const cuando = i === 1 ? "mañana" : `el ${NOMBRES_DIAS[dia].toLowerCase()}`;
            return `abre ${cuando} a las ${abre} hs`;
        }
    }
    return "";
};

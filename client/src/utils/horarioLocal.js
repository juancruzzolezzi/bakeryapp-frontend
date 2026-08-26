// Calcula si el local está abierto AHORA según horarioAtencion (ver
// constants/contacto.js), en vez de tener que actualizar un texto fijo a
// mano cada vez.
export const estaAbiertoAhora = (horarioAtencion, ahora = new Date()) => {
    const { dias, abre, cierra } = horarioAtencion;
    const dia = ahora.getDay();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;

    return dias.includes(dia) && hora >= abre && hora < cierra;
};

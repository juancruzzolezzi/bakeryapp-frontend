// TODO: reemplazar mail y horarios por los datos reales del local cuando estén disponibles
export const CONTACTO = {
    instagramUser: "bakery.oficial",
    instagramUrl: "https://www.instagram.com/bakery.oficial",
    whatsappNumero: "5491167565288",
    whatsappTexto: "+54 9 11 6756-5288",
    email: "contactobakery@gmail.com",
    direccion: "Zavalía 2026, Belgrano",
    horario: "Lun a Sáb, 9 a 20hs",
    // Mismo horario de arriba, pero en formato que se pueda calcular (ver
    // utils/horarioLocal.js): días de la semana según getDay() (0 = domingo,
    // 1 = lunes, ... 6 = sábado) y hora de apertura/cierre en 24hs.
    horarioAtencion: {
        dias: [1, 2, 3, 4, 5, 6], // Lunes a sábado
        abre: 9,
        cierra: 20,
    },
};

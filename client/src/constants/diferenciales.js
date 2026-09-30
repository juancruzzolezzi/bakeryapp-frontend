import {
    faBreadSlice,
    faMugHot,
    faGraduationCap,
    faCakeCandles,
    faPaw,
    faLeaf,
} from "@fortawesome/free-solid-svg-icons";

// Lo que distingue al local (sale del Business Model Canvas): se muestra
// en el Home y en Nosotros, así que vive acá para no repetir los textos.
// "icono" es un ícono de FontAwesome (se usa con <FontAwesomeIcon />).
// TODO: ajustar los textos si cambia algo del local.
export const DIFERENCIALES = [
    {
        icono: faBreadSlice,
        titulo: "Horneado en el día",
        texto: "Todo sale de nuestro horno cada mañana. Nada de stock de días anteriores.",
    },
    {
        icono: faMugHot,
        titulo: "Café de especialidad",
        texto: "Granos seleccionados y baristas que lo preparan como se debe.",
    },
    {
        icono: faGraduationCap,
        titulo: "Formación Gato Dumas",
        texto: "Pasteleros formados en el Instituto Gato Dumas: técnica profesional en cada receta.",
    },
    {
        icono: faCakeCandles,
        titulo: "Eventos",
        texto: "Tortas, mesas dulces y catering para cumpleaños y celebraciones.",
    },
    {
        icono: faPaw,
        titulo: "Pet-friendly",
        texto: "Tu mascota es bienvenida en el local. Vení con ella a tomar un café.",
    },
    {
        icono: faLeaf,
        titulo: "Opciones para todos",
        texto: "Productos sin TACC y veganos, para que nadie se quede afuera.",
    },
];

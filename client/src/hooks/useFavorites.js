import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "favoritos";

// Cada tarjeta de producto usa su propia instancia de este hook, así que el
// estado de React de una no se entera cuando otra cambia (aunque las dos
// escriban al mismo localStorage). Este evento avisa a todas las instancias
// montadas (y "storage" avisa entre pestañas distintas) para que se
// refresquen desde localStorage apenas una de ellas togglea un favorito.
const FAVORITES_EVENT = "favoritos-changed";

const readFavorites = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
};

const writeToggle = (id) => {
    const current = readFavorites();
    const next = current.includes(id)
        ? current.filter((favId) => favId !== id)
        : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
};

// Favoritos guardados solo en este navegador (localStorage), sin backend:
// alcanza para que alguien marque lo que le gusta y lo encuentre después
// con el filtro "Favoritos" en Productos.
//
// Este hook trae la lista COMPLETA: sirve para Products.jsx (necesita el
// array entero para el contador y para filtrar por "Favoritos"). Para una
// tarjeta individual (Product.jsx, ProductDetail.jsx) conviene "useIsFavorite"
// de más abajo en vez de este.
export const useFavorites = () => {
    const [favorites, setFavorites] = useState(readFavorites);

    useEffect(() => {
        const sync = () => setFavorites(readFavorites());
        window.addEventListener(FAVORITES_EVENT, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(FAVORITES_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const isFavorite = useCallback(
        (id) => favorites.includes(id),
        [favorites]
    );

    const toggleFavorite = useCallback((id) => {
        writeToggle(id);
    }, []);

    return { favorites, isFavorite, toggleFavorite };
};

// Versión "escuchá solo lo mío" para una tarjeta puntual: en vez de guardar
// el array completo (que cambia de referencia cada vez que CUALQUIER
// producto se marca/desmarca, forzando a re-renderizar TODAS las tarjetas
// que usan el hook), guarda un booleano ya resuelto para ESTE id. Cuando el
// evento avisa un cambio, si el resultado para este id da igual que antes
// (era otro producto el que cambió), React frena solo el re-render: pedirle
// a setState el mismo valor que ya tenía no dispara una vuelta a renderizar.
export const useIsFavorite = (id) => {
    const [isFav, setIsFav] = useState(() => readFavorites().includes(id));

    useEffect(() => {
        const sync = () => setIsFav(readFavorites().includes(id));
        sync();
        window.addEventListener(FAVORITES_EVENT, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(FAVORITES_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, [id]);

    const toggle = useCallback(() => {
        writeToggle(id);
    }, [id]);

    return [isFav, toggle];
};

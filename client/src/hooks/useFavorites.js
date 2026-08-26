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

// Favoritos guardados solo en este navegador (localStorage), sin backend:
// alcanza para que alguien marque lo que le gusta y lo encuentre después
// con el filtro "Favoritos" en Productos.
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
        const current = readFavorites();
        const next = current.includes(id)
            ? current.filter((favId) => favId !== id)
            : [...current, id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(FAVORITES_EVENT));
    }, []);

    return { favorites, isFavorite, toggleFavorite };
};

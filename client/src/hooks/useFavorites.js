import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "favoritos";

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const isFavorite = useCallback(
        (id) => favorites.includes(id),
        [favorites]
    );

    const toggleFavorite = useCallback((id) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
        );
    }, []);

    return { favorites, isFavorite, toggleFavorite };
};

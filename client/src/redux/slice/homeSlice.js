import { createSlice } from "@reduxjs/toolkit";

// Con try/catch, como en authSlice: esto corre al cargar el módulo, antes
// de que exista React, así que si el valor guardado estaba roto (versión
// vieja de la app, una extensión, edición a mano) la página quedaba en
// blanco y el ErrorBoundary no llegaba a atajarlo.
const savedCart = (() => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(cart) ? cart : null;
  } catch {
    return null;
  }
})();

const homeSlice = createSlice({
  name: "home",
  initialState: {
    cartList: savedCart || [],
  },
  reducers: {
    addToCart: (state, action) => {
      const newProduct = action.payload;
      const existingProductIndex = state.cartList.findIndex(
        (product) => product.id === newProduct.id
      );

      if (existingProductIndex !== -1) {
        // Sumar la cantidad al producto existente
        state.cartList[existingProductIndex].quantity += newProduct.quantity;
      } else {
        // Agregar nuevo producto al carrito
        state.cartList.push(newProduct);
      }

      localStorage.setItem("cart", JSON.stringify(state.cartList));
    },
    updateCart: (state, action) => {
      // Actualiza el carrito con la nueva lista de productos
      state.cartList = action.payload;
      localStorage.setItem("cart", JSON.stringify(state.cartList));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingProduct = state.cartList.find(
        (product) => product.id === productId
      );

      if (existingProduct) {
        existingProduct.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(state.cartList));
      }
    },
    removeFromCart: (state, action) => {
      state.cartList = state.cartList.filter(
        (item) => item.id !== action.payload.id
      );
      localStorage.setItem("cart", JSON.stringify(state.cartList));
    },
    // Pisa nombre, precio y foto de cada producto del carrito con los
    // actuales del catálogo, y saca los que ya no existen (ver
    // hooks/useCartSync.js). La cantidad elegida se mantiene.
    syncCartWithCatalog: (state, action) => {
      const catalogo = new Map(action.payload.map((p) => [String(p.id), p]));
      state.cartList = state.cartList
        .filter((item) => catalogo.has(String(item.id)))
        .map((item) => ({ ...catalogo.get(String(item.id)), quantity: item.quantity }));
      localStorage.setItem("cart", JSON.stringify(state.cartList));
    },
    emptyCart: (state) => {
      state.cartList = [];
      localStorage.removeItem("cart");
    },
  },
});


export const {
    addToCart,
    updateCart,
    updateQuantity,
    removeFromCart,
    syncCartWithCatalog,
    emptyCart,
} = homeSlice.actions;

export default homeSlice.reducer;

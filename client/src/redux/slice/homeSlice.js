import { createSlice } from "@reduxjs/toolkit";

const savedCart = JSON.parse(localStorage.getItem("cart"));

const homeSlice = createSlice({
  name: "home",
  initialState: {
    allProducts: [],
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
    emptyCart: (state) => {
      state.cartList = [];
      localStorage.removeItem("cart");
    },
  },
});


export const {
    setSetectedProduct,
    getProductById,
    addToCart,
    updateQuantity,
    removeFromCart,
    emptyCart,
} = homeSlice.actions;

export default homeSlice.reducer;

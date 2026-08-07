import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeFromCart } from "../redux/slice/homeSlice";

export const useProductHandlers = (setModalEmptyOpen) => {
  const dispatch = useDispatch();
  const [setQuantity] = useState(1);
  const cartList = useSelector((state) => state.homeSlice.cartList);
  
  const handleAddToCart = (product, quantity) => {
    const existingProductIndex = cartList.findIndex(
      (cartProduct) => cartProduct.id === product.id
    );

    if (existingProductIndex >= 0) {
      // Crear una copia del producto existente con la cantidad actualizada
      const updatedProduct = {
        ...cartList[existingProductIndex],
        quantity: cartList[existingProductIndex].quantity + quantity,
      };

      // Dispatch de la acción con el carrito actualizado
      dispatch(
        updateQuantity({
          productId: product.id,
          quantity: updatedProduct.quantity,
        })
      );
    } else {
      // Agrega el nuevo producto al carrito
      dispatch(addToCart({ ...product, quantity }));
    }
  };

    const handleIncrementDetail = (product, quantity) => {
      if (quantity < 100) {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity); // Actualiza el estado local de cantidad
      }
    };

    const handleDecrementDetail = (product, quantity) => {
      if (quantity > 1) {
        const newQuantity = quantity - 1;
        setQuantity(newQuantity); // Actualiza el estado local de cantidad
      }
    };

  const handleIncrementCart = (product, newQuantity) => {
    const existingProductIndex = cartList.findIndex(
      (cartProduct) => cartProduct.id === product.id
    );

    if (existingProductIndex !== -1) {
      dispatch(
        updateQuantity({ productId: product.id, quantity: newQuantity })
      );
    }
  };

  const handleDecrementCart = (product, newQuantity) => {
    const existingProductIndex = cartList.findIndex(
      (cartProduct) => cartProduct.id === product.id
    );

    if (existingProductIndex !== -1) {
      dispatch(
        updateQuantity({ productId: product.id, quantity: newQuantity })
      );
    }
  };

    const handleDelete = (productId) => {
        dispatch(removeFromCart({ id: productId }));
        setModalEmptyOpen(false);
    };

    const handleModalCancel = () => {
        setModalEmptyOpen(false);
    };

    return {
        handleAddToCart,
        handleIncrementDetail,
        handleDecrementDetail,
        handleIncrementCart,
        handleDecrementCart,
        handleDelete,
        handleModalCancel,
    };
};
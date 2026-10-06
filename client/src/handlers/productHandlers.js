import { useDispatch } from "react-redux";
import { addToCart, updateQuantity, removeFromCart } from "../redux/slice/homeSlice";

// Este hook lo usa CADA tarjeta de producto de la grilla (Product.jsx),
// más ProductDetail.jsx y ProductCart.jsx. Antes traía el cartList entero
// con useSelector para chequear a mano si el producto ya estaba (y sumarle
// la cantidad) o si había que agregarlo nuevo — pero el reducer
// "addToCart" (ver homeSlice.js) ya hace exactamente esa misma cuenta
// solo. Al sacar ese useSelector de acá, agregar o sacar CUALQUIER
// producto ya no fuerza a volver a renderizar TODAS las demás tarjetas de
// la grilla (que también usan este hook) solo porque estaban "suscriptas"
// al carrito entero sin necesitarlo.
export const useProductHandlers = (setModalEmptyOpen) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product, quantity) => {
    dispatch(addToCart({ ...product, quantity }));
  };

  //El reducer "updateQuantity" (ver homeSlice.js) ya solo actualiza si
  //encuentra el producto en el carrito; no hace falta repetir ese chequeo
  //acá (y menos leyendo el cartList entero solo para eso).
  const handleIncrementCart = (product, newQuantity) => {
    dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
  };

  const handleDecrementCart = (product, newQuantity) => {
    dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
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
        handleIncrementCart,
        handleDecrementCart,
        handleDelete,
        handleModalCancel,
    };
};
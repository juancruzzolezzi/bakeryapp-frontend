import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../api/appApi";
import { addToCart } from "../redux/slice/homeSlice";
import { useToast } from "../context/ToastContext";

// "Repetir este pedido" (seguimiento y "Mis pedidos"): agrega al carrito
// los productos de un pedido viejo con los datos actuales del catálogo
// (precio de hoy), salta los que ya no existen y lleva a Productos.
// Devuelve [repetir, listo]: "listo" es false hasta que carga el catálogo.
export const useRepetirPedido = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { data: productos } = useGetProductsQuery();

  const repetir = (pedido) => {
    const catalogo = new Map((productos || []).map((p) => [String(p.id), p]));
    let agregados = 0;
    pedido.items.forEach((item) => {
      const producto = catalogo.get(String(item.id));
      if (producto) {
        dispatch(addToCart({ ...producto, quantity: item.quantity }));
        agregados++;
      }
    });
    if (agregados === 0) {
      showToast("Esos productos ya no están disponibles", "🛒");
      return;
    }
    showToast(
      agregados < pedido.items.length
        ? "Agregamos lo que sigue disponible a tu pedido"
        : "Agregamos todo a tu pedido",
      "🛒"
    );
    navigate("/products");
  };

  return [repetir, Boolean(productos)];
};

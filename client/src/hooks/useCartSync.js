import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../api/appApi";
import { syncCartWithCatalog } from "../redux/slice/homeSlice";
import { useToast } from "../context/ToastContext";

const plural = (n, singular, pluralTexto) => (n === 1 ? singular : pluralTexto);

// El carrito se guarda en localStorage con el producto entero, precio
// incluido. Sin esto, si un precio cambiaba, el carrito seguía mostrando
// el viejo mientras Mercado Pago cobraba el nuevo (el backend toma el
// precio de la base), y un producto borrado recién fallaba al pagar.
//
// Cuando llega el catálogo, se cruza con el carrito: se actualizan nombre,
// precio y foto, y se sacan los productos que ya no existen. Si el carrito
// está vacío no se pide nada.
export const useCartSync = () => {
  const cartList = useSelector((state) => state.homeSlice.cartList);
  const dispatch = useDispatch();
  const showToast = useToast();
  const { data: products } = useGetProductsQuery(undefined, {
    skip: cartList.length === 0,
  });

  useEffect(() => {
    if (!products || cartList.length === 0) return;

    const catalogo = new Map(products.map((p) => [String(p.id), p]));
    let quitados = 0;
    let preciosCambiados = 0;
    let desactualizados = 0;

    cartList.forEach((item) => {
      const actual = catalogo.get(String(item.id));
      if (!actual) {
        quitados++;
      } else if (actual.price !== item.price) {
        preciosCambiados++;
      } else if (
        actual.title !== item.title ||
        (actual.images?.[0] || "") !== (item.images?.[0] || "")
      ) {
        desactualizados++;
      }
    });

    //Solo se despacha si algo cambió: después del dispatch el carrito ya
    //coincide con el catálogo y este efecto no vuelve a hacer nada.
    if (quitados + preciosCambiados + desactualizados === 0) return;
    dispatch(syncCartWithCatalog(products));

    if (quitados > 0) {
      showToast(
        `Sacamos ${quitados} ${plural(quitados, "producto que ya no está disponible", "productos que ya no están disponibles")} de tu pedido`,
        "🛒"
      );
    } else if (preciosCambiados > 0) {
      showToast(
        `Actualizamos el precio de ${preciosCambiados} ${plural(preciosCambiados, "producto", "productos")} de tu pedido`,
        "🛒"
      );
    }
  }, [products, cartList, dispatch, showToast]);
};

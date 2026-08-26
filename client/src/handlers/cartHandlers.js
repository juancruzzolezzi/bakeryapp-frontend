import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { emptyCart } from "../redux/slice/homeSlice";

export const useCartHandlers = (

  //setModalEmptyOpen y setIsCartOpen solo los usa Cart.jsx (modal de vaciar carrito).
  //PaymentModal usa este hook sin argumentos, ya que maneja su propio estado.
  setModalEmptyOpen,
  setIsCartOpen

) => {

  //Estado de carga y error de la petición de pago (feedback visual en el modal)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  //URL de la API: toma REACT_APP_API_URL (Vercel) o cae a localhost en desarrollo
  const apiURL = process.env.REACT_APP_API_URL || "http://localhost:3000";


  //Se declara la constante "dispatch" la cual ejecuta el Hook de React "useDispatch()"
  const dispatch = useDispatch();

  //Token de sesión (si hay), para que el backend sepa qué cuenta hace el
  //pedido y le aplique el 10% OFF (ver optionalAuth en el backend). Sin
  //esto el backend no tiene forma de saber quién está comprando y el
  //descuento no se cobraría de verdad, aunque se muestre en la pantalla.
  const token = useSelector((state) => state.authSlice.token);




  //Submit Carrito
  const handleSubmitModal = async (

    //Recibe 6 parametros:
    cartList, //Productos en el carrito
    clientContact, //Instagram o WhatsApp del cliente, según contactMethod
    contactMethod, //"instagram" o "whatsapp"
    totalPrice, // Precio total del carrito
    deliveryType, //"delivery" o "takeaway"
    address // Dirección de entrega (solo si deliveryType es "delivery")

  ) => {
    setIsSubmitting(true);
    setSubmitError("");

    //"fetch" no tiene timeout nativo (a diferencia de axios): se arma a
    //mano con AbortController, mismo límite de 60s que antes (el backend
    //gratuito puede tardar hasta ~50s en responder si estaba "dormido").
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {

      //Envia a la API (/create-order) los datos del pedido
      const response = await fetch(`${apiURL}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cartList,
          clientContact,
          contactMethod,
          totalPrice,
          deliveryType,
          address,
        }),
        signal: controller.signal,
      });

      //A diferencia de axios, "fetch" no tira error solo por una respuesta
      //4xx/5xx: hay que chequearlo a mano para que el catch de abajo se
      //entere igual que antes.
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      //Recibe la respuesta de la API y redirecciona al usuario al checkout real de Mercado Pago
      const data = await response.json();
      const initPoint = data.init_point;

      //Marca que se fue a Mercado Pago: si vuelve sin que MP haya agregado
      //?payment=success/failure/pending a la URL (ej: tocó "Volver al
      //sitio" o el botón atrás sin llegar a pagar), Products.jsx usa esta
      //marca para saber que el pago quedó sin completar y avisarle
      //(ver "pagoAbandonado" en Products.jsx).
      sessionStorage.setItem("mpCheckoutIniciado", "1");

      //Guarda este pedido como "el último", para poder ofrecer "Repetir
      //pedido" con el carrito vacío más adelante (ver Cart.jsx). Se guarda
      //acá (al iniciar el pago) y no recién si se confirma, porque el
      //frontend no se entera de forma confiable de un pago aprobado hecho
      //fuera del sitio (Mercado Pago no vuelve a avisar en todos los casos).
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({ items: cartList, date: new Date().toISOString() })
      );

      window.location.href = initPoint;

    } catch (error) {

      //Se manejan eventuales errores y se muestran al usuario
      setSubmitError(
        "No se pudo iniciar el pago. Probá de nuevo en unos segundos."
      );
      setIsSubmitting(false);

    } finally {
      clearTimeout(timeoutId);
    }
  };




  //Cancelar la limpieza del carrito
  const handleModalCancel = () => {
    setModalEmptyOpen(false);
  };




  //Borrar limpiar datos del carrito
  const handleModalYes = () => {

    //Hace dispatch de una funcion que deberia borrar el contenido del carrito
    dispatch(emptyCart());

    //Setea a modalEmptyOpen y a setIsCartOpen en false
    setModalEmptyOpen(false);
    setIsCartOpen(false)
  };




  //Devuelve todos los handlers para poder utilizarlos en componentes React
  return {
    handleSubmitModal,
    handleModalCancel,
    handleModalYes,
    isSubmitting,
    submitError,
  };
};
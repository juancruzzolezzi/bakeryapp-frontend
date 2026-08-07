import { useState } from "react";
import { useDispatch } from "react-redux";
import { emptyCart } from "../redux/slice/homeSlice";
import axios from "axios";

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




  //Submit Carrito
  const handleSubmitModal = async (

    //Recibe 4 parametros:
    cartList, //Productos en el carrito
    clientContact, //Instagram o WhatsApp del cliente, según contactMethod
    contactMethod, //"instagram" o "whatsapp"
    totalPrice // Precio total del carrito

  ) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {

      //Envia a la API (/createorder) los datos del pedido
      //El backend gratuito puede tardar hasta ~50s si estaba "dormido" por inactividad
      const response = await axios.post(`${apiURL}/create-order`, {
        cartList,
        clientContact,
        contactMethod,
        totalPrice,
      }, { timeout: 60000 });

      //Recibe la respuesta de la API y redirecciona al usuario al checkout real de Mercado Pago
      const initPoint = response.data.init_point;
      console.log("esta es la response.data", response.data);
      window.location.href = initPoint;

    } catch (error) {

      //Se manejan eventuales errores y se muestran al usuario
      console.log("soy el error", error); //jajaja "Hola! Soy el error y vengo a cagarte la vida :)"
      setSubmitError(
        "No se pudo iniciar el pago. Probá de nuevo en unos segundos."
      );
      setIsSubmitting(false);

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
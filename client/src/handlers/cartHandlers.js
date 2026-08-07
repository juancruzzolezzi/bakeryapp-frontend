import { useDispatch } from "react-redux";
import { emptyCart } from "../redux/slice/homeSlice";
import axios from "axios";
import { validations } from "../validations/validations";

export const useCartHandlers = (

  //Recibe 5 parametros
  setInstagramUsername,
  setTouched,
  setError,
  setModalEmptyOpen,
  setIsCartOpen

) => {

  //URL de la API: toma REACT_APP_API_URL (Vercel) o cae a localhost en desarrollo
  const apiURL = process.env.REACT_APP_API_URL || "http://localhost:3000";


  //Se declara la constante "dispatch" la cual ejecuta el Hook de React "useDispatch()"
  const dispatch = useDispatch();
  //Trae la funcion "isValidInstagramUsername" del componente "validations"
  const { isValidInstagramUsername } = validations();




  //Submit Carrito
  const handleSubmitModal = async (

    //Recibe 3 parametros:
    cartList, //Productos en el carrito
    clientInstagramUsername, //Usuario de instagram del cliente
    totalPrice // Precio total del carrito

  ) => {
    try {

      //Envia a la API (/createorder) los 3 parametros que recibe
      const response = await axios.post(`${apiURL}/create-order`, {
        cartList,
        clientInstagramUsername,
        totalPrice,
      });

      //Recibe la respuesta de la API y redirecciona al usuario
      const initPoint = response.data.init_point;
      console.log("esta es la response.data", response.data);
      window.location.href = initPoint;

    } catch (error) {

      //Se manejan eventuales errores
      console.log("soy el error", error); //jajaja "Hola! Soy el error y vengo a cagarte la vida :)"

    }
  };




  //Confirmacion de Instagram
  const handleInputChange = (e) => {

    //Guarda en una constante el @usuario de instagram
    const inputValue = e.target.value;

    //Guarda en un estado local el @usuario de instagram
    setInstagramUsername(inputValue);

    setTouched(true);

    //Guarda el @usuario de instagram en una constante la cual indica que es valido
    const isUsernameValid = isValidInstagramUsername(inputValue);

    //Si el usaurio es incorrecto, devuelve un mensaje avisando ésto
    setError(isUsernameValid ? "" : "Usuario de Instagram no válido");
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
    handleInputChange,
    handleModalCancel,
    handleModalYes,
  };
};
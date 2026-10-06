import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { base_URL } from "../api/base_URL";
import { logout, setCredentials } from "../redux/slice/authSlice";
import { useToast } from "../context/ToastContext";

// Al arrancar la app, valida contra GET /me el token guardado en
// localStorage. Antes nunca se validaba: con el token vencido (dura 30
// días) el sitio seguía mostrando la sesión iniciada y el 10% OFF, pero el
// backend ya no lo aplicaba y Mercado Pago cobraba el precio completo.
//
// Solo se cierra la sesión si el backend dice que el token no sirve (401)
// o que la cuenta ya no existe (404). Si no hay conexión o el backend está
// "dormido", se deja la sesión como estaba.
export const useSessionCheck = () => {
  const token = useSelector((state) => state.authSlice.token);
  const dispatch = useDispatch();
  const showToast = useToast();

  useEffect(() => {
    if (!token) return;
    let cancelado = false;

    fetch(`${base_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (cancelado) return;
        if (response.status === 401 || response.status === 404) {
          dispatch(logout());
          showToast("Tu sesión venció. Volvé a iniciar sesión.", "🔒");
          return;
        }
        if (response.ok) {
          //De paso actualiza nombre/email por si cambiaron.
          const data = await response.json().catch(() => null);
          if (!cancelado && data?.user) dispatch(setCredentials({ user: data.user, token }));
        }
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [token, dispatch, showToast]);
};

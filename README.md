BakeryApp es una plantilla de eCommerce diseñada para ser flexible y reutilizable, permitiendo crear tiendas online de manera rápida y eficiente. Este proyecto ha sido desarrollado para ofrecer una solución escalable que se puede adaptar a cualquier tipo de negocio, con integración completa de pagos y funcionalidades clave para gestionar productos y usuarios.

Tecnologías utilizadas

Frontend:
⚛️ React (Create React App)
🗂️ Redux Toolkit + RTK Query
🧭 React Router
🎨 GSAP
🖼️ FontAwesome
📱 PWA (service worker, instalable)

Backend (repo BakeryApp---BackEnd):
🛠️ Node.js + Express
🗄️ SQLite (better-sqlite3)
🔐 JWT + login con Google
💳 Mercado Pago (checkout + webhook)
✉️ Mailjet (mails de confirmación)

Despliegue:
▲ Vercel (frontend)
🌐 Render (backend)

Funcionalidades principales
🛒 Carrito de compras interactivo: se mantiene al día con los precios del catálogo.
💳 Pagos seguros: el total se calcula en el backend con los precios de la base, no con los del navegador.
🎟️ 10% OFF para cuentas registradas, delivery por zonas y envío gratis desde un monto mínimo.
✉️ Notificaciones automáticas por correo: al cliente y al local, tras un pago aprobado.
↩️ Botón de arrepentimiento (Res. 424/2020) con código de solicitud.
🌐 Responsive design: adaptable a cualquier dispositivo.

Cómo levantarlo en local

1. Backend (carpeta `api` del repo de backend), en el puerto 3000:

   ```
   npm install
   npm start        # o "npm run dev" para que se reinicie solo al guardar
   npm test         # tests de precios, envío y descuento
   ```

   Variables del `.env`: `ACCESS_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET` (Mercado Pago), `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER_EMAIL`, `EMAIL_USER`, `SHOP_OWNER_EMAIL`, `FRONTEND_URL`, `BACKEND_URL` y `ADMIN_KEY`.

2. Frontend (carpeta `client`), en el puerto 3001:

   ```
   npm install
   npm start
   ```

   Variables del `.env` (ver `.env.example`): `REACT_APP_API_URL` y `REACT_APP_GOOGLE_CLIENT_ID`.

Editar el catálogo

Crear, editar y borrar productos (`POST /products`, `PUT /products/:id`, `DELETE /products/:id`) pide el header `x-admin-key` con el valor de `ADMIN_KEY`. En el `PUT` alcanza con mandar los campos que cambian. Ejemplo:

```
curl -X PUT https://<backend>/products/5 \
  -H "x-admin-key: <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"price": 3500}'
```

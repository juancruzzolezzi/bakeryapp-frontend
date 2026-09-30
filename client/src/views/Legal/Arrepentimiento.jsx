import React, { useState } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import { useSolicitarArrepentimientoMutation } from "../../api/appApi";
import styles from "./Legal.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CAMPOS_INICIALES = {
    nombre: "",
    email: "",
    telefono: "",
    pedido: "",
    fechaPedido: "",
    motivo: "",
};

// Botón de arrepentimiento (Res. 424/2020 de la Secretaría de Comercio
// Interior): tiene que poder usarse sin cuenta ni login, y al enviarlo el
// cliente recibe un código que identifica su solicitud (lo genera el
// backend, ver api/legal/arrepentimiento.routes.js).
const Arrepentimiento = () => {
    const [campos, setCampos] = useState(CAMPOS_INICIALES);
    const [error, setError] = useState("");
    const [resultado, setResultado] = useState(null);
    const [solicitar, { isLoading }] = useSolicitarArrepentimientoMutation();

    const actualizar = (campo) => (e) =>
        setCampos((prev) => ({ ...prev, [campo]: e.target.value }));

    const enviar = async (e) => {
        e.preventDefault();
        if (!campos.nombre.trim() || !EMAIL_REGEX.test(campos.email.trim())) {
            setError("Completá tu nombre y un email válido.");
            return;
        }
        setError("");
        try {
            const data = await solicitar(campos).unwrap();
            setResultado(data);
        } catch (err) {
            setError(
                err?.data?.error ||
                    "No pudimos enviar tu solicitud. Probá de nuevo o escribinos por WhatsApp."
            );
        }
    };

    return (
        <LegalLayout
            titulo="Botón de arrepentimiento"
            mostrarFecha={false}
            intro="Si hiciste una compra en nuestra tienda online, podés revocarla dentro de los 10 días corridos desde la compra o la entrega, sin costo y sin tener que dar explicaciones."
        >
            <p>
                Completá este formulario y te vamos a dar un código de identificación
                de tu solicitud. No hace falta tener cuenta. Tené en cuenta que, por ser
                alimentos frescos, conviene avisarnos antes de que preparemos o
                entreguemos tu pedido (ver{" "}
                <Link to="/cambios-y-devoluciones">cambios y devoluciones</Link>).
            </p>

            {resultado ? (
                <div className={styles.success} role="status">
                    <p>
                        <strong>¡Recibimos tu solicitud!</strong> Este es tu código de
                        identificación:
                    </p>
                    <span className={styles.code}>{resultado.code}</span>
                    <p>
                        {resultado.emailSent
                            ? `También te lo mandamos a ${campos.email.trim()}. `
                            : "Guardalo: no pudimos mandártelo por email. "}
                        Nos vamos a comunicar con vos para gestionar la devolución del
                        dinero.
                    </p>
                </div>
            ) : (
                <form className={styles.form} onSubmit={enviar} noValidate>
                    <label className={styles.field}>
                        Nombre y apellido
                        <input
                            type="text"
                            value={campos.nombre}
                            onChange={actualizar("nombre")}
                            autoComplete="name"
                            maxLength={120}
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        Email
                        <input
                            type="email"
                            value={campos.email}
                            onChange={actualizar("email")}
                            autoComplete="email"
                            maxLength={160}
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        <span>
                            Teléfono <span className={styles.optional}>(opcional)</span>
                        </span>
                        <input
                            type="tel"
                            value={campos.telefono}
                            onChange={actualizar("telefono")}
                            autoComplete="tel"
                            maxLength={40}
                        />
                    </label>
                    <label className={styles.field}>
                        <span>
                            Fecha de la compra <span className={styles.optional}>(opcional)</span>
                        </span>
                        <input
                            type="date"
                            value={campos.fechaPedido}
                            onChange={actualizar("fechaPedido")}
                        />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                        <span>
                            N° de operación de Mercado Pago o detalle del pedido{" "}
                            <span className={styles.optional}>(opcional)</span>
                        </span>
                        <input
                            type="text"
                            value={campos.pedido}
                            onChange={actualizar("pedido")}
                            maxLength={80}
                        />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                        <span>
                            Comentarios <span className={styles.optional}>(opcional)</span>
                        </span>
                        <textarea
                            value={campos.motivo}
                            onChange={actualizar("motivo")}
                            maxLength={1000}
                        />
                    </label>

                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar solicitud"}
                    </button>
                </form>
            )}
        </LegalLayout>
    );
};

export default Arrepentimiento;

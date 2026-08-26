import React from "react";

// Se exporta para que App.js pueda borrarla apenas la app levanta bien
// (ver ahí): evita loopear si el reload automático no arregla nada, sin
// bloquear un auto-reload legítimo más adelante en la misma pestaña.
export const RELOAD_FLAG = "chunkReloadIntentado";

// Detecta los errores típicos de un chunk que no se pudo descargar (ver
// React.lazy en App.js): pasa sobre todo justo después de un deploy nuevo,
// cuando el navegador todavía tiene en caché una versión vieja de la
// página que apunta a archivos con hashes que ya no existen en el server.
const esErrorDeChunk = (error) =>
  /loading chunk|failed to fetch dynamically imported module|importing a module script failed/i.test(
    error?.message || ""
  );

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    // Antes, un chunk que fallaba en cargar (ver React.lazy en App.js) no
    // tenía quién lo atajara: React desmontaba todo en silencio y quedaba
    // una pantalla en blanco hasta que alguien refrescara a mano. Si es
    // justo ese tipo de error, se intenta recargar solo UNA vez (el flag
    // evita un loop infinito si el problema fuera otra cosa) antes de
    // mostrarle nada al usuario.
    if (esErrorDeChunk(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.crashed) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            background: "#171009",
            color: "#f6ecdb",
            fontFamily: "Lexend, sans-serif",
          }}
        >
          <p style={{ margin: 0, fontSize: "1.05rem" }}>
            Algo no cargó bien. Probá recargar la página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "#e7c98a",
              border: "1px solid #e7c98a",
              color: "#241a10",
              fontWeight: 700,
              padding: "0.7rem 1.5rem",
              borderRadius: "999px",
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

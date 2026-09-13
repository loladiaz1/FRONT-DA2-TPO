import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Completá usuario y contraseña");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
        padding: "20px",
      }}
    >
      <div className="form-card" style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "22px" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>Iniciar Sesión</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Ingresá tus credenciales para acceder al sistema
          </p>
        </div>

        {error && <div className="message message--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              autoFocus
              disabled={loading}
              required
            />
          </label>

          <label style={{ marginTop: "12px" }}>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            className="button button--primary"
            style={{ width: "100%", marginTop: "18px", height: "40px" }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Sección sobria para pruebas de cátedra */}
        <div style={{ marginTop: "22px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            Cuentas para prueba rápida:
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="button button--secondary"
              style={{ flex: 1, padding: "6px 8px", fontSize: "12px", minHeight: "32px" }}
              onClick={() => setDemoUser("admin", "admin123")}
            >
              admin (ADMIN)
            </button>
            <button
              type="button"
              className="button button--secondary"
              style={{ flex: 1, padding: "6px 8px", fontSize: "12px", minHeight: "32px" }}
              onClick={() => setDemoUser("operador", "operador123")}
            >
              operador (OPERADOR)
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-secondary)" }}>¿No tenés cuenta? </span>
          <Link to="/register">Registrate</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

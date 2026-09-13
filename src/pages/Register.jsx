import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password.trim()) {
      setError("Completá todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await register(cleanUsername, password);
      setSuccess(`Usuario "${res.username}" creado correctamente. Redirigiendo al login...`);
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Error al registrar el usuario");
    } finally {
      setLoading(false);
    }
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
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>Registro de Usuario</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Crear una cuenta nueva con rol OPERADOR
          </p>
        </div>

        {error && <div className="message message--error">{error}</div>}
        {success && <div className="message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              autoFocus
              disabled={loading || !!success}
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
              disabled={loading || !!success}
              required
            />
          </label>

          <label style={{ marginTop: "12px" }}>
            Confirmar Contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetir contraseña"
              disabled={loading || !!success}
              required
            />
          </label>

          <button
            type="submit"
            className="button button--primary"
            style={{ width: "100%", marginTop: "18px", height: "40px" }}
            disabled={loading || !!success}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-secondary)" }}>¿Ya tenés cuenta? </span>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

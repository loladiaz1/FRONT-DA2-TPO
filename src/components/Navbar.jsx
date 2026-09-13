import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.rol === "ADMIN";

  return (
    <nav className="navbar" aria-label="Navegacion principal">
      <a className="navbar__brand" href="/dashboard">LogiRed</a>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", color: "var(--text)" }}>
            <strong>{user.username}</strong> ({user.rol || "OPERADOR"})
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="button button--secondary"
            style={{
              padding: "5px 12px",
              minHeight: "32px",
              fontSize: "13px",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
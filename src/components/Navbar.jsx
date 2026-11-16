import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" aria-label="Navegacion principal">
      <Link className="navbar__brand" to="/dashboard">LogiRed</Link>

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
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar" aria-label="Navegacion secundaria">
      <span className="sidebar__title">Menu</span>
      <NavLink className="sidebar__link" to="/dashboard">Dashboard</NavLink>
      <NavLink className="sidebar__link" to="/catalogo">Catálogo</NavLink>
      <NavLink className="sidebar__link" to="/pedidos">Pedidos</NavLink>
      <NavLink className="sidebar__link" to="/inventario">Inventario</NavLink>
      <NavLink className="sidebar__link" to="/ruteo">Ruteo</NavLink>
      {user?.rol === "ADMIN" && <NavLink className="sidebar__link" to="/mensajeria">Eventos</NavLink>}
    </aside>
  );
}

export default Sidebar
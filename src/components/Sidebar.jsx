import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegacion secundaria">
      <span className="sidebar__title">Menu</span>
      <NavLink className="sidebar__link" to="/dashboard">Dashboard</NavLink>
      <NavLink className="sidebar__link" to="/catalogo">Catálogo</NavLink>
      <NavLink className="sidebar__link" to="/pedidos">Pedidos</NavLink>
      <NavLink className="sidebar__link" to="/inventario">Inventario</NavLink>
      <NavLink className="sidebar__link" to="/ruteo">Ruteo</NavLink>
      <NavLink className="sidebar__link" to="/mensajeria">Eventos</NavLink>
    </aside>
  );
}

export default Sidebar
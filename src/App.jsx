import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CrearPedido from "./pages/CrearPedido";
import Catalogo from "./pages/Catalogo";
import Dashboard from "./pages/Dashboard";
import DetalleProducto from "./pages/DetalleProducto";
import DetallePedido from "./pages/DetallePedido";
import FormularioProducto from "./pages/FormularioProducto";
import Inventario from "./pages/Inventario";
import Login from "./pages/Login";
import Mensajeria from "./pages/Mensajeria";
import Pedidos from "./pages/Pedidos";
import Register from "./pages/Register";
import Ruteo from "./pages/Ruteo";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Protegidas bajo Autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/catalogo/nuevo" element={<FormularioProducto />} />
            <Route path="/catalogo/:id" element={<DetalleProducto />} />
            <Route path="/catalogo/:id/editar" element={<FormularioProducto />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/nuevo" element={<CrearPedido />} />
            <Route path="/pedidos/:id" element={<DetallePedido />} />
            <Route path="/pedidos/:id/editar" element={<CrearPedido />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/ruteo" element={<Ruteo />} />
            <Route path="/mensajeria" element={<Mensajeria />} />
          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
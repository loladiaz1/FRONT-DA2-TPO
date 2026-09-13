import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import CrearPedido from "./pages/CrearPedido";
import Dashboard from "./pages/Dashboard";
import DetallePedido from "./pages/DetallePedido";
import EditarPedido from "./pages/EditarPedido";
import Inventario from "./pages/Inventario";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";
import Register from "./pages/Register";

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
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/nuevo" element={<CrearPedido />} />
            <Route path="/pedidos/:id" element={<DetallePedido />} />
            <Route path="/pedidos/:id/editar" element={<EditarPedido />} />
            <Route path="/inventario" element={<Inventario />} />
          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
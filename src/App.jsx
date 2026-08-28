import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import CrearPedido from "./pages/CrearPedido";
import DetallePedido from "./pages/DetallePedido";
import EditarPedido from "./pages/EditarPedido";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/pedidos/nuevo" element={<CrearPedido />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} />
        <Route path="/pedidos/:id/editar" element={<EditarPedido />} />
      </Route>
    </Routes>
  );
}

export default App;
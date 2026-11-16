import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import Loading from "./Loading";
import { obtenerDepositoDefault } from "../services/depositoService";

function MapaDeposito({ depositoPedido, depositoInfo }) {
  const [depositoDefault, setDepositoDefault] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    obtenerDepositoDefault()
      .then((data) => { if (active) setDepositoDefault(data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const activo = (depositoInfo && Number.isFinite(Number(depositoInfo.latitud)))
    ? depositoInfo
    : (depositoPedido && typeof depositoPedido === "object" && Number.isFinite(Number(depositoPedido.latitud)))
      ? depositoPedido
      : depositoDefault;

  if (loading && !activo) {
    return <Loading message="Cargando ubicación del depósito..." />;
  }

  const latitud = Number(activo?.latitud) || -34.6037;
  const longitud = Number(activo?.longitud) || -58.3816;
  const nombre = activo?.nombre || (typeof depositoPedido === "string" && depositoPedido ? depositoPedido : "Depósito Central LogiRed");
  const direccion = activo?.direccion || "Av. 9 de Julio s/n, junto al Obelisco, CABA";
  const osmUrl = activo?.openStreetMapUrl || `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=16/${latitud}/${longitud}`;

  return (
    <div className="warehouse-map">
      <MapContainer center={[latitud, longitud]} zoom={14} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={[latitud, longitud]} radius={9} pathOptions={{ color: "#ed8c1a", fillColor: "#fdb662", fillOpacity: 0.95 }}>
          <Popup><strong>{nombre}</strong><br />{direccion}</Popup>
        </CircleMarker>
      </MapContainer>
      <p><strong>{nombre}</strong> · {direccion}</p>
      {osmUrl && (
        <a href={osmUrl} target="_blank" rel="noreferrer">Abrir en OpenStreetMap</a>
      )}
    </div>
  );
}

export default MapaDeposito;

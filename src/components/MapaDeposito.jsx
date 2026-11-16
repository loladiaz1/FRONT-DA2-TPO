import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import Loading from "./Loading";
import { obtenerDepositoDefault } from "../services/depositoService";

function MapaDeposito({ depositoPedido }) {
  const [deposito, setDeposito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerDepositoDefault()
      .then((data) => { if (active) setDeposito(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading message="Cargando ubicación del depósito..." />;
  if (error) return <p className="message message--error">No se pudo cargar el depósito. {error}</p>;

  const latitud = Number(deposito?.latitud);
  const longitud = Number(deposito?.longitud);
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return <p className="message message--error">El backend no devolvió coordenadas válidas para el depósito.</p>;
  }
  const nombreDeposito = deposito.nombre?.trim().toLocaleLowerCase();
  if (!depositoPedido || depositoPedido.trim().toLocaleLowerCase() !== nombreDeposito) {
    return <p className="field-hint">
      {depositoPedido
        ? `El backend solo proporciona coordenadas de ${deposito.nombre}; el pedido corresponde a ${depositoPedido}. No se muestra una ubicación no confirmada.`
        : "El pedido no especifica un depósito identificable; no se puede mostrar un marcador con certeza."}
    </p>;
  }

  return (
    <div className="warehouse-map">
      <MapContainer center={[latitud, longitud]} zoom={14} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={[latitud, longitud]} radius={9} pathOptions={{ color: "#ed8c1a", fillColor: "#fdb662", fillOpacity: 0.95 }}>
          <Popup>{deposito.nombre}<br />{deposito.direccion}</Popup>
        </CircleMarker>
      </MapContainer>
      <p><strong>{deposito.nombre}</strong> · {deposito.direccion}</p>
      {deposito.openStreetMapUrl && (
        <a href={deposito.openStreetMapUrl} target="_blank" rel="noreferrer">Abrir en OpenStreetMap</a>
      )}
    </div>
  );
}

export default MapaDeposito;

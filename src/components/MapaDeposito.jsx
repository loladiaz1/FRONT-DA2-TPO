import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import Loading from "./Loading";
import { obtenerDepositoDefault } from "../services/depositoService";

const normalizarTexto = (valor = "") => String(valor)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .replace(/\s+/g, " ")
  .toLocaleLowerCase();

const tieneCoordenadas = (ubicacion) => (
  ubicacion
  && ubicacion.latitud != null
  && ubicacion.longitud != null
  && Number.isFinite(Number(ubicacion.latitud))
  && Number.isFinite(Number(ubicacion.longitud))
);

function MapaDeposito({ depositoPedido, depositoInfo }) {
  const [depositoPredeterminado, setDepositoPredeterminado] = useState(null);
  const infoDirecta = tieneCoordenadas(depositoInfo) ? depositoInfo : tieneCoordenadas(depositoPedido) ? depositoPedido : null;
  const [loading, setLoading] = useState(!infoDirecta);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!infoDirecta) {
      obtenerDepositoDefault()
        .then((data) => { if (active) setDepositoPredeterminado(data); })
        .catch((requestError) => { if (active) setError(requestError.message); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [infoDirecta]);

  const deposito = infoDirecta || depositoPredeterminado;

  if (loading && !deposito) return <Loading message="Cargando ubicación del depósito..." />;
  if (error && !deposito) return <p className="message message--error">No se pudo cargar el depósito. {error}</p>;
  if (!deposito) return <p className="message message--error">No hay información del depósito para mostrar.</p>;

  const latitud = Number(deposito?.latitud) || -34.6037;
  const longitud = Number(deposito?.longitud) || -58.3816;
  const nombre = deposito?.nombre || "Depósito Central LogiRed";
  const direccion = deposito?.direccion || "Av. 9 de Julio s/n, junto al Obelisco, CABA";
  const osmUrl = deposito?.openStreetMapUrl || `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=16/${latitud}/${longitud}`;

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

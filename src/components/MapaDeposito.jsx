import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Loading from "./Loading";
import { obtenerDepositoDefault } from "../services/depositoService";

const tieneCoordenadas = (ubicacion) => (
  ubicacion
  && ubicacion.latitud != null
  && ubicacion.longitud != null
  && Number.isFinite(Number(ubicacion.latitud))
  && Number.isFinite(Number(ubicacion.longitud))
  && Number(ubicacion.latitud) >= -90
  && Number(ubicacion.latitud) <= 90
  && Number(ubicacion.longitud) >= -180
  && Number(ubicacion.longitud) <= 180
);

function CapturarPuntoEntrega({ activo, onSeleccionarEntrega }) {
  useMapEvents({
    click(event) {
      if (activo) {
        onSeleccionarEntrega({
          latitud: event.latlng.lat,
          longitud: event.latlng.lng,
        });
      }
    },
  });

  return null;
}

function AjustarVista({ origen, destino }) {
  const map = useMap();
  const [origenLatitud, origenLongitud] = origen;
  const [destinoLatitud, destinoLongitud] = destino || [];

  useEffect(() => {
    if (destinoLatitud != null && destinoLongitud != null) {
      map.fitBounds(
        [[origenLatitud, origenLongitud], [destinoLatitud, destinoLongitud]],
        { padding: [32, 32], maxZoom: 14 },
      );
    }
  }, [destinoLatitud, destinoLongitud, map, origenLatitud, origenLongitud]);

  return null;
}

function MapaDeposito({
  depositoPedido,
  depositoInfo,
  direccionEntrega,
  latitudEntrega,
  longitudEntrega,
  onSeleccionarEntrega,
  privado = false,
}) {
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

  const latitud = tieneCoordenadas(deposito) ? Number(deposito.latitud) : -34.6037;
  const longitud = tieneCoordenadas(deposito) ? Number(deposito.longitud) : -58.3816;
  const nombre = deposito?.nombre || "Depósito Central LogiRed";
  const direccion = deposito?.direccion || "Av. 9 de Julio s/n, junto al Obelisco, CABA";
  const osmUrl = deposito?.openStreetMapUrl || `https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=16/${latitud}/${longitud}`;
  const origen = [latitud, longitud];
  const destino = tieneCoordenadas({ latitud: latitudEntrega, longitud: longitudEntrega })
    ? [Number(latitudEntrega), Number(longitudEntrega)]
    : null;

  return (
    <div className={`warehouse-map${privado ? " warehouse-map--schematic" : ""}`}>
      <MapContainer center={origen} zoom={14} scrollWheelZoom={false}>
        {!privado && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <CapturarPuntoEntrega activo={Boolean(onSeleccionarEntrega)} onSeleccionarEntrega={onSeleccionarEntrega} />
        <AjustarVista origen={origen} destino={destino} />
        <CircleMarker center={origen} radius={9} pathOptions={{ color: "#ed8c1a", fillColor: "#fdb662", fillOpacity: 0.95 }}>
          <Popup><strong>{nombre}</strong><br />{direccion}</Popup>
        </CircleMarker>
        {destino && (
          <>
            <Polyline positions={[origen, destino]} pathOptions={{ color: "#084ba6", weight: 4, dashArray: "8 7" }}>
              <Popup>Línea recta aproximada; no sigue calles.</Popup>
            </Polyline>
            <CircleMarker center={destino} radius={9} pathOptions={{ color: "#084ba6", fillColor: "#60a5fa", fillOpacity: 0.95 }}>
              <Popup><strong>Entrega</strong><br />{direccionEntrega || "Punto elegido en el mapa"}</Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>
      <p><strong>{nombre}</strong> · {direccion}</p>
      {destino && (
        <p><strong>Entrega:</strong> {direccionEntrega || "Punto elegido en el mapa"}</p>
      )}
      {privado && onSeleccionarEntrega && (
        <p className="field-hint">Hacé clic en el mapa para ubicar la entrega. El trazo es recto y aproximado; no representa calles.</p>
      )}
      {privado && !destino && !onSeleccionarEntrega && (
        <p className="field-hint">Este pedido todavía no tiene una ubicación de entrega guardada.</p>
      )}
      {!privado && osmUrl && (
        <a href={osmUrl} target="_blank" rel="noreferrer">Abrir en OpenStreetMap</a>
      )}
    </div>
  );
}

export default MapaDeposito;

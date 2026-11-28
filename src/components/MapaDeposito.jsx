import { useEffect, useMemo, useState } from "react";
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
import {
  DEPOSITO_BARRACAS,
  buscarCoordenadasPorDireccion,
  generarTrayectoriaAproximada,
} from "../utils/direccionesPredefinidas";

const tieneCoordenadasValidas = (lat, lon) => (
  lat != null
  && lon != null
  && Number.isFinite(Number(lat))
  && Number.isFinite(Number(lon))
  && Number(lat) >= -90
  && Number(lat) <= 90
  && Number(lon) >= -180
  && Number(lon) <= 180
);

const tieneCoordenadas = (ubicacion) => (
  ubicacion && tieneCoordenadasValidas(ubicacion.latitud, ubicacion.longitud)
);

function CapturarPuntoEntrega({ activo, onSeleccionarEntrega }) {
  useMapEvents({
    click(event) {
      if (activo && onSeleccionarEntrega) {
        onSeleccionarEntrega({
          latitud: Number(event.latlng.lat.toFixed(5)),
          longitud: Number(event.latlng.lng.toFixed(5)),
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
        { padding: [40, 40], maxZoom: 14 },
      );
    } else {
      map.setView([origenLatitud, origenLongitud], 13);
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

  // Si no hay depósito del backend aún, usamos el Depósito Central Barracas por defecto
  const latitudOrigen = tieneCoordenadas(deposito)
    ? Number(deposito.latitud)
    : DEPOSITO_BARRACAS.latitud;
  const longitudOrigen = tieneCoordenadas(deposito)
    ? Number(deposito.longitud)
    : DEPOSITO_BARRACAS.longitud;
  const nombreDeposito = deposito?.nombre || DEPOSITO_BARRACAS.nombre;
  const direccionDeposito = deposito?.direccion || DEPOSITO_BARRACAS.direccion;
  const origen = useMemo(
    () => [latitudOrigen, longitudOrigen],
    [latitudOrigen, longitudOrigen],
  );

  // Resolver coordenadas de destino: o las pasadas explícitamente, o por catálogo de dirección
  const destino = useMemo(() => {
    if (tieneCoordenadasValidas(latitudEntrega, longitudEntrega)) {
      return [Number(latitudEntrega), Number(longitudEntrega)];
    }
    if (direccionEntrega) {
      const match = buscarCoordenadasPorDireccion(direccionEntrega);
      if (match) {
        return [match.latitud, match.longitud];
      }
    }
    return null;
  }, [latitudEntrega, longitudEntrega, direccionEntrega]);

  // Trayectoria realista estimada (curvas/avenidas aproximadas sin consumir APIs externas)
  const trayectoria = useMemo(() => {
    if (!destino) return [];
    return generarTrayectoriaAproximada(origen, destino, direccionEntrega);
  }, [origen, destino, direccionEntrega]);

  if (loading && !deposito && !infoDirecta) {
    return <Loading message="Cargando ubicación del mapa..." />;
  }

  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitudOrigen}&mlon=${longitudOrigen}#map=14/${latitudOrigen}/${longitudOrigen}`;

  return (
    <div className="warehouse-map">
      <MapContainer
        center={origen}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "350px", borderRadius: "8px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CapturarPuntoEntrega
          activo={Boolean(onSeleccionarEntrega)}
          onSeleccionarEntrega={onSeleccionarEntrega}
        />
        <AjustarVista origen={origen} destino={destino} />

        {/* Marcador del Depósito de Despacho */}
        <CircleMarker
          center={origen}
          radius={10}
          pathOptions={{ color: "#d97706", fillColor: "#fbbf24", fillOpacity: 0.95, weight: 3 }}
        >
          <Popup>
            <strong>🏢 {nombreDeposito}</strong>
            <br />
            {direccionDeposito}
            <br />
            <small>Punto de origen y despacho</small>
          </Popup>
        </CircleMarker>

        {/* Trazado del recorrido y Marcador de Entrega */}
        {destino && (
          <>
            <Polyline
              positions={trayectoria.length > 0 ? trayectoria : [origen, destino]}
              pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.85,
                lineCap: "round",
                lineJoin: "round",
              }}
            >
              <Popup>
                <strong>Recorrido aproximado de entrega</strong>
                <br />
                Trazado realista por arterias principales de CABA (sin consumo de APIs externas).
              </Popup>
            </Polyline>

            <CircleMarker
              center={destino}
              radius={10}
              pathOptions={{ color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 0.95, weight: 3 }}
            >
              <Popup>
                <strong>📍 Destino de Entrega</strong>
                <br />
                {direccionEntrega || "Punto de entrega en CABA"}
                <br />
                <small>Coordenadas: {destino[0].toFixed(5)}, {destino[1].toFixed(5)}</small>
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      <div className="warehouse-map__info" style={{ marginTop: "8px", fontSize: "14px" }}>
        <p><strong>Origen:</strong> 🏢 {nombreDeposito} ({direccionDeposito})</p>
        {destino ? (
          <p>
            <strong>Entrega:</strong> 📍 {direccionEntrega || "Punto de entrega"}
            {" "}({destino[0].toFixed(5)}, {destino[1].toFixed(5)})
          </p>
        ) : (
          <p className="field-hint">
            {onSeleccionarEntrega
              ? "Elegí una dirección del catálogo o hacé clic en el mapa para marcar el punto de entrega."
              : "Este pedido todavía no tiene coordenadas de entrega asignadas."}
          </p>
        )}
        {error && <p className="field-hint" style={{ color: "#f87171" }}>Nota: {error}</p>}
        {osmUrl && (
          <p style={{ marginTop: "4px" }}>
            <a href={osmUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--accent)" }}>
              Ver zona en OpenStreetMap ↗
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default MapaDeposito;

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

function SelectorUbicacion({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([event.latlng.lat, event.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function LocationMap({ latitud, longitud, onLocationChange }) {
  const initialPosition =
    latitud && longitud
      ? [latitud, longitud]
      : [-34.6037, -58.3816]; // Buenos Aires

  const [position, setPosition] = useState(
    latitud && longitud ? [latitud, longitud] : null
  );

  const seleccionarUbicacion = (nuevaPosicion) => {
    setPosition(nuevaPosicion);

    onLocationChange({
      latitud: nuevaPosicion[0],
      longitud: nuevaPosicion[1],
    });
  };

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SelectorUbicacion
        position={position}
        setPosition={seleccionarUbicacion}
      />
    </MapContainer>
  );
}

export default LocationMap;
# LogiRed frontend

Interfaz web de operaciones logísticas hecha con React y Vite. Consume el backend Spring Boot en `http://localhost:8080`.

## Desarrollo local

```sh
npm install
npm run dev
```

El backend debe estar disponible en `http://localhost:8080` y permitir CORS desde el origen local de Vite.

## Integración con el backend

- Inicio de sesión y registro usan `POST /api/auth/login` y `POST /api/auth/register`. El registro crea un usuario `OPERADOR`.
- El login no devuelve JWT. Las solicitudes protegidas envían HTTP Basic; las credenciales se conservan codificadas en `sessionStorage` hasta cerrar la sesión del navegador.
- Catálogo, pedidos, inventario, depósito, ruteo y eventos usan las rutas `/api/productos`, `/api/pedido`, `/api/inventario`, `/api/deposito/default`, `/api/ruteo/optimizar` y `/api/mensajeria/eventos`.
- Las acciones de inventario envían cookies de sesión (`credentials: "include"`). Las reservas manuales vencen a los cinco minutos; el checkout de pedidos reserva stock por sí mismo.
- El mapa utiliza Leaflet y mosaicos de OpenStreetMap. Solo marca las coordenadas del depósito proporcionadas por el backend; no geocodifica direcciones de entrega ni representa navegación real.
- Los eventos se consultan por REST; no se establece una conexión WebSocket.

El frontend solo envía al crear pedidos cliente, dirección y líneas (`productoId` y `cantidad`); el backend calcula el total. La edición de pedidos no está expuesta en la interfaz porque el contrato de solicitud del `PUT /api/pedido/{id}` no está documentado.

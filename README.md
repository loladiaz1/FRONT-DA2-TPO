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
- Operadores pueden crear y editar pedidos/productos. Las opciones de eliminación se muestran solo a `admin`; el backend vuelve a validar el rol y el nombre de esa cuenta.
- Catálogo, pedidos, inventario, depósito, ruteo y eventos usan las rutas `/api/productos`, `/api/pedido`, `/api/inventario`, `/api/deposito/default`, `/api/ruteo/optimizar` y `/api/mensajeria/eventos`.
- El catálogo usa `GET/POST /api/productos` y `GET/PUT/DELETE /api/productos/{id}`. Los pedidos usan `GET/POST /api/pedido` y `GET/PUT/DELETE /api/pedido/{id}`. Cada pedido incluye `mapaEntregaUrl`; el mapa Leaflet muestra las coordenadas del depósito asociado.
- Las acciones de inventario envían cookies de sesión (`credentials: "include"`). Las reservas manuales vencen a los cinco minutos; el checkout de pedidos reserva stock por sí mismo.
- El mapa utiliza Leaflet y mosaicos de OpenStreetMap. Solo marca las coordenadas del depósito proporcionadas por el backend; no geocodifica direcciones de entrega ni representa navegación real.
- Los eventos se consultan por REST; no se establece una conexión WebSocket.

Al crear y editar pedidos, el frontend envía cliente, dirección y líneas (`productoId` y `cantidad`); el backend calcula el total y reserva stock. Al editar un pedido, el formulario incluye las unidades que ya están reservadas por ese pedido al validar la disponibilidad.

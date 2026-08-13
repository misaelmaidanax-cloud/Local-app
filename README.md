# Local Finder

CREA ESTE PROYECTO, ENFOCATE EN LA PARTE WEB 
PRD — App de Comercio Local (Mapa de Productos y Precios)

1. Resumen del producto

App web que le permite a un usuario buscar un producto y ver, en un mapa, qué comercios locales (kioscos, almacenes) lo tienen disponible, a qué precio y a qué distancia. Cada comercio carga su propio catálogo de productos con foto, nombre y precio de forma simple y rápida.

No es un marketplace ni un ecommerce tradicional. No hay pasarela de pago online en esta primera versión (el pago se resuelve en el local al retirar). El objetivo es reducir la fricción de "no sé si lo tienen, no sé cuánto sale, no sé si está abierto" antes de que el cliente se mueva hasta el local.

Tipo de plataforma: aplicación web, no descargable ni publicada en tiendas de apps. Se accede desde el navegador (Chrome u otro) en celular o computadora. Al ingresar, el navegador debe solicitar permiso de geolocalización del dispositivo, que se usa para centrar el mapa y calcular distancias a los comercios. Debe funcionar correctamente en formato mobile (uso principal) y también en desktop.

2. Problema a resolver

El cliente no sabe si un comercio cercano tiene el producto que busca, ni el precio, sin ir físicamente o llamar.

El comerciante no tiene una forma simple de mostrar su oferta de productos actualizada.

No existe hoy una herramienta que combine mapa + búsqueda de producto específico + precio + horario, enfocada en comercio de barrio (no en delivery de comida).

3. Roles de usuario

La plataforma tiene tres roles: Cliente (que puede navegar como invitado o como registrado), Comerciante y Administrador de la plataforma.

3.1 Cliente

Busca un producto puntual (ej: "Coca Cola 1.5L", "pilas AA", "detergente").

Quiere saber rápido: quién lo tiene, a qué precio, a qué distancia, si está abierto ahora.

Puede navegar, buscar, ver precios y generar un pedido para retirar sin necesidad de registrarse. El registro no es una barrera para comprar, es opcional y suma beneficios (historial, pedidos más rápidos la próxima vez).

3.2 Comerciante

Dueño/encargado de un kiosco, almacén o comercio de barrio.

Quiere cargar su catálogo de forma rápida, sin fricción, principalmente desde el celular.

No es necesariamente una persona con manejo avanzado de tecnología.

Necesita ver y gestionar los pedidos que le llegan, y tener control simple de su stock.

3.3 Administrador de la plataforma

Rol interno (el equipo del proyecto), no un usuario final.

Supervisa el listado de comercios dados de alta, puede activar/desactivar/moderar un comercio, y tiene visibilidad general de la actividad de la plataforma (cantidad de comercios, pedidos, búsquedas).

4. Alcance del MVP

4.1 Cliente invitado (sin registrarse)

Al entrar, el navegador solicita permiso de ubicación; con eso se arma el mapa centrado y las distancias.

Pantalla principal con mapa (protagonista) mostrando comercios cercanos.

Buscador de productos con autocompletado.

Al buscar un producto, el mapa resalta/filtra los pines de los comercios que lo tienen cargado, mostrando el precio sobre o junto al pin.

Lista de resultados debajo o junto al mapa, ordenable por menor distancia o menor precio.

Ficha de comercio (bottom sheet o panel lateral) con nombre, estado abierto/cerrado, horario, producto buscado con foto y precio, y botón "Cómo llegar".

Filtros básicos: categoría, abierto ahora, distancia máxima.

Puede armar un pedido y generarlo para retirar en el local, sin necesidad de crear una cuenta. Al finalizar el pedido, se le pide únicamente un dato de contacto (nombre y teléfono) para que el comerciante pueda identificarlo al retirar, sin exigir registro completo.

Al confirmar el pedido, se genera un mensaje pre-armado con el detalle completo (productos, cantidades, precio total, datos de contacto y un link al resumen del pedido dentro de la app) que se abre en WhatsApp apuntando al número del comercio. El cliente solo confirma el envío desde WhatsApp. Esto reemplaza, en esta primera versión, la necesidad de una API de WhatsApp Business.

4.2 Cliente registrado (opcional)

Registro/login simple (email o Google).

Todo lo del cliente invitado, más un panel de cuenta propio donde puede ver:

Historial de pedidos realizados (comercio, productos, fecha, estado: pendiente / listo para retirar / retirado / cancelado).

Datos de contacto guardados, para no tenerlos que reingresar en cada pedido.

Comercios favoritos (opcional en esta primera versión).

4.3 Comerciante

Registro/alta de comercio: nombre, dirección (geolocalizada en mapa), categoría/rubro, horario de atención por día, número de WhatsApp donde va a recibir los pedidos.

Panel de catálogo propio, tipo grilla de tarjetas (foto + nombre + precio):

Botón "Agregar producto": saca foto (cámara o galería) → completa nombre → completa precio → guarda.

Editar producto existente (cambiar foto, nombre o precio).

Activar/desactivar disponibilidad de un producto sin borrarlo (control simple de stock: disponible / no disponible).

Eliminar producto.

Debe soportar carga de 100-200 productos sin que el flujo se vuelva tedioso: cada carga individual tiene que ser mínima, y volver a empezar rápido para el siguiente.

Edición rápida de horario (incluyendo marcar "cerrado hoy" para excepciones puntuales).

Panel de pedidos recibidos: lista de pedidos entrantes con detalle de productos, cliente/contacto y estado, además de llegarle también como mensaje de WhatsApp. El comerciante puede cambiar el estado (pendiente → listo → retirado, o cancelado) desde el panel.

Panel de transacciones: historial de pedidos ya retirados, a modo de registro simple de lo vendido a través de la plataforma (sin gestión contable avanzada en esta versión).

4.4 Administrador de la plataforma

Listado de todos los comercios registrados, con posibilidad de activar/desactivar/dar de baja uno.

Visibilidad general: cantidad de comercios activos, cantidad de pedidos generados, búsquedas más frecuentes.

Este panel es interno del equipo, no se expone a clientes ni comerciantes.

4.5 Fuera de alcance en el MVP (para fases futuras)

Automatización completa vía WhatsApp Business API (envío automático sin intervención del cliente, notificaciones de estado por WhatsApp al cliente). En el MVP el envío por WhatsApp se resuelve con un link pre-armado (wa.me) que el cliente confirma manualmente.

Pagos online dentro de la app (el pago se resuelve en el local).

Delivery propio del comercio.

Aplicación descargable / publicación en tiendas de apps.

Carga masiva de productos por foto de góndola completa.

Sugerencia automática de nombre de producto por reconocimiento de imagen.

Reviews o calificaciones de comercios.

5. Flujos principales

Flujo Cliente (búsqueda)

Abre la app en el navegador → acepta el permiso de ubicación → ve el mapa centrado con comercios cercanos.

Busca un producto en el buscador.

Ve en el mapa los pines de los comercios que lo tienen, con precio visible.

Toca un pin o una tarjeta de la lista → se abre la ficha del comercio con el detalle del producto, precio y horario.

Toca "Cómo llegar" → se abre la navegación externa (Google Maps).

Flujo Cliente (pedido para retirar, sin login)

Desde la ficha del comercio, agrega uno o más productos a su pedido.

Confirma el pedido → completa nombre y teléfono de contacto.

La app arma el pedido, lo guarda, y abre WhatsApp con un mensaje pre-armado (detalle del pedido + link al resumen) apuntando al número del comercio.

El cliente confirma el envío del mensaje desde WhatsApp.

Puede ver el estado de su pedido (si es cliente registrado, en su historial; si es invitado, en el link al resumen que recibió).

Retira el producto en el local y paga ahí.

Flujo Comerciante

Se registra y da de alta su comercio (nombre, dirección, rubro, horario).

Entra a su panel de catálogo (vacío al inicio).

Toca "Agregar producto" → saca/sube foto → escribe nombre → escribe precio → guarda.

Repite el paso 3 tantas veces como productos tenga.

Puede volver en cualquier momento a editar precio, desactivar o eliminar un producto.

Recibe pedidos en su panel de pedidos, los marca como "listo" cuando están preparados y como "retirado" cuando el cliente pasa a buscarlos.

6. Modelo de datos (borrador inicial)

Usuario

id, nombre, email, tipo (cliente / comerciante), fecha de registro

Comercio

id, id_usuario (dueño), nombre, dirección, latitud, longitud, categoría/rubro, horario (estructura por día con hora apertura/cierre), whatsapp (número de contacto para pedidos), estado activo

Producto

id, id_comercio, nombre, foto_url, precio, categoría, disponible (booleano), fecha_actualización

Pedido

id, id_comercio, id_usuario (nulo si es invitado), nombre_contacto, teléfono_contacto, productos (lista de id_producto + cantidad + precio al momento del pedido), estado (pendiente / listo / retirado / cancelado), fecha_creación

7. Diseño y experiencia visual

Estilo minimalista, moderno, con identidad propia (no clonar visualmente Google Maps).

El mapa es el elemento protagonista de la pantalla principal.

Pines diferenciados visualmente cuando el comercio tiene el producto buscado (destacados) vs. cuando no.

Panel de comerciante con grilla de tarjetas tipo catálogo visual (foto grande, nombre y precio legibles), pensado para uso mobile-first, ya que el comerciante va a cargar productos principalmente desde su celular.

Prioridad: velocidad de carga para el comerciante y velocidad de comprensión para el cliente (ver precio y distancia de un vistazo, sin pasos extra).

8. Métricas de éxito del MVP

Cantidad de comercios activos con catálogo cargado (mínimo 10 productos).

Cantidad de búsquedas de producto realizadas por usuarios.

Tasa de comercios que actualizan su catálogo después de la primera semana (indicador de que el flujo de carga es lo suficientemente simple).

9. Preguntas abiertas para próximas iteraciones

¿Rubro y zona geográfica de lanzamiento inicial para validar?

¿Cómo se valida que el comercio efectivamente tiene el stock cargado (evitar catálogos desactualizados)?

¿Notificación al comerciante para recordarle actualizar precios/stock periódicamente?

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9825dc98-6faf-4152-8ccd-d698d57c34d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

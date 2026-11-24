# Sistema de Delivery - MVP MongoDB (Bases de Datos 2)

Programa mínimo viable (MVP) desarrollado en Node.js con el driver oficial de MongoDB para gestionar y analizar operaciones de una plataforma de pedidos de comida a domicilio.

## Qué hace el programa
El sistema modela la operativa de una app de delivery (clientes, restaurantes con sus menús y pedidos) y ejecuta consultas analíticas mediante **Aggregation Pipelines** para obtener métricas de negocio por consola:
1. **Ventas por categoría:** Filtra pedidos entregados, cruza con restaurantes y calcula cantidad de pedidos, facturación total y ticket promedio por rubro.
2. **Top 5 platos más vendidos:** Desglosa los ítems embebidos de cada pedido entregado para obtener el ranking de los 5 productos con mayor volumen de unidades vendidas y su recaudación.
3. **Clientes frecuentes:** Identifica a los usuarios con 2 o más pedidos entregados, cruza sus datos personales y muestra su ciudad, categoría favorita y gasto acumulado.

## Colecciones y estructura del modelo

El modelo consta de tres colecciones relacionadas:

- **`clientes`**: guarda los datos personales y de contacto, ciudad y fecha de alta. `direcciones` es un arreglo de direcciones embebidas y `preferencias` es un objeto embebido con la categoría favorita y la preferencia de recibir promociones. `email` tiene un índice único.
- **`restaurantes`**: guarda los datos del local (categoría, ciudad, dirección, calificación, tiempo estimado, costo de envío y estado) junto con `menu`, un arreglo embebido de platos. Cada plato tiene un `platoId`, nombre, categoría, precio, descripción y disponibilidad.
- **`pedidos`**: guarda número, fecha, estado, método de pago e importes. `clienteId` y `restauranteId` son referencias a los documentos de sus respectivas colecciones. `items` es un arreglo embebido con el identificador del plato y una copia de su nombre y precio al momento de la compra, además de cantidad, subtotal y aclaraciones. `direccionEntrega` también se guarda embebida como copia de la dirección usada en ese pedido.

Así, un cliente y un restaurante pueden estar relacionados con varios pedidos. Los datos de clientes y restaurantes se obtienen mediante `$lookup` cuando los informes los necesitan; los platos y demás datos propios de cada pedido se consultan directamente en el documento.

## Justificación de las decisiones de diseño

- **Embedding en `clientes`**: las direcciones y preferencias pertenecen al cliente y se consultan junto con él. Mantenerlas en el mismo documento evita separar datos pequeños y dependientes en otras colecciones.
- **Embedding en `restaurantes`**: los platos forman parte del menú del local y se usan junto con sus datos. Para el alcance de este MVP, el menú tiene un tamaño acotado y no requiere una colección independiente.
- **Embedding en `pedidos`**: los ítems son el detalle propio de cada compra. Guardar una copia del nombre y precio conserva el valor histórico aunque el menú cambie; además, permite analizar los platos con `$unwind` sin buscar cada ítem por separado. La dirección embebida conserva dónde debía entregarse ese pedido.
- **Referencing desde `pedidos`**: clientes y restaurantes se reutilizan en muchos pedidos y mantienen datos que pueden cambiar. Guardar sus identificadores evita duplicar esos datos en cada compra y permite cruzarlos con `$lookup` para los informes.

El diseño combina ambas estrategias según el uso de cada dato: evita referencias innecesarias para información que se consume junto a su documento, pero mantiene referencias para entidades compartidas. En un modelo relacional habría mayor normalización y restricciones de integridad entre tablas; en este modelo documental, los ítems y las copias históricas simplifican la lectura y el análisis del pedido, a cambio de aceptar cierta duplicación intencional.

## Cómo ejecutarlo

### Requisitos previos
- Node.js (v20 o superior)[cite: 4]
- MongoDB corriendo localmente o un clúster en MongoDB Atlas

### Pasos de instalación y ejecución
1. Clonar el repositorio e instalar las dependencias:
   ```bash
   npm install
   ```
2. Crear un archivo `.env` a partir de `.env.example` y configurar `MONGODB_URI` y, opcionalmente, `DB_NAME`.
3. Cargar los datos de ejemplo:
   ```bash
   npm run seed
   ```
   **Atención:** el seed vacía las colecciones `clientes`, `restaurantes` y `pedidos` antes de insertar los datos de ejemplo.
4. Ejecutar los pipelines:
   ```bash
   npm start
   ```

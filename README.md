# Sistema de Delivery - MVP MongoDB (Bases de Datos 2)

Programa mínimo viable (MVP) desarrollado en Node.js con el driver oficial de MongoDB para gestionar y analizar operaciones de una plataforma de pedidos de comida a domicilio.

## Qué hace el programa
El sistema modela la operativa de una app de delivery (clientes, restaurantes con sus menús y pedidos) y ejecuta consultas analíticas mediante **Aggregation Pipelines** para obtener métricas de negocio por consola:
1. **Ventas por categoría:** Filtra pedidos entregados, cruza con restaurantes y calcula cantidad de pedidos, facturación total y ticket promedio por rubro.
2. **Top 5 platos más vendidos:** Desglosa los ítems embebidos de cada pedido entregado para obtener el ranking de los 5 productos con mayor volumen de unidades vendidas y su recaudación.
3. **Clientes frecuentes:** Identifica a los usuarios con 2 o más pedidos entregados, cruza sus datos personales y muestra su ciudad, categoría favorita y gasto acumulado.

## Cómo ejecutarlo

### Requisitos previos
- Node.js (v20 o superior)[cite: 4]
- MongoDB corriendo localmente o un clúster en MongoDB Atlas

### Pasos de instalación y ejecución
1. Clonar el repositorio e instalar las dependencias:
   ```bash
   npm install
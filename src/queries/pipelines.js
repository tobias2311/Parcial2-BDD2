export function getVentasPorCategoria(db) {
  return db.collection('pedidos').aggregate([
    { $match: { estado: 'entregado' } },
    {
      $lookup: {
        from: 'restaurantes',
        localField: 'restauranteId',
        foreignField: '_id',
        as: 'infoRestaurante'
      }
    },
    { $unwind: '$infoRestaurante' },
    {
      $group: {
        _id: '$infoRestaurante.categoria',
        cantidadPedidos: { $sum: 1 },
        facturacionTotal: { $sum: '$total' },
        ticketPromedio: { $avg: '$total' }
      }
    },
    {
      $project: {
        _id: 0,
        categoria: '$_id',
        cantidadPedidos: 1,
        facturacionTotal: 1,
        ticketPromedio: { $round: ['$ticketPromedio', 2] }
      }
    },
    { $sort: { facturacionTotal: -1 } }
  ]).toArray();
}

export function getTopPlatosMasVendidos(db) {
  return db.collection('pedidos').aggregate([
    { $match: { estado: 'entregado' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.nombrePlato',
        unidadesVendidas: { $sum: '$items.cantidad' },
        recaudacionTotal: { $sum: '$items.subtotal' }
      }
    },
    {
      $project: {
        _id: 0,
        plato: '$_id',
        unidadesVendidas: 1,
        recaudacionTotal: 1
      }
    },
    { $sort: { unidadesVendidas: -1 } },
    { $limit: 5 }
  ]).toArray();
}

export function getClientesFrecuentes(db) {
  return db.collection('pedidos').aggregate([
    { $match: { estado: 'entregado' } },
    {
      $group: {
        _id: '$clienteId',
        pedidosRealizados: { $sum: 1 },
        gastoTotal: { $sum: '$total' }
      }
    },
    { $match: { pedidosRealizados: { $gte: 2 } } },
    {
      $lookup: {
        from: 'clientes',
        localField: '_id',
        foreignField: '_id',
        as: 'infoCliente'
      }
    },
    { $unwind: '$infoCliente' },
    {
      $project: {
        _id: 0,
        cliente: { $concat: ['$infoCliente.nombre', ' ', '$infoCliente.apellido'] },
        ciudad: '$infoCliente.ciudad',
        categoriaFavorita: '$infoCliente.preferencias.categoriaFavorita',
        pedidosRealizados: 1,
        gastoTotal: 1
      }
    },
    { $sort: { gastoTotal: -1 } }
  ]).toArray();
}
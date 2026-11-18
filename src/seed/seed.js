import { ObjectId } from 'mongodb';
import { connectDB, closeDB } from '../config/db.js';

function elegirAlAzar(lista) {
  const indice = Math.floor(Math.random() * lista.length);
  return lista[indice];
}

function numeroAlAzar(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const db = await connectDB();

  try {
    // 1. Limpiamos las 3 colecciones en paralelo antes de insertar
    await Promise.all([
      db.collection('clientes').deleteMany({}),
      db.collection('restaurantes').deleteMany({}),
      db.collection('pedidos').deleteMany({})
    ]);

    // 2. COLECCIÓN 1: CLIENTES (35 documentos)
    const nombres = ['Lucas', 'Sofía', 'Mateo', 'Valentina', 'Julián', 'Camila', 'Tomás', 'Martina'];
    const apellidos = ['Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Pérez', 'Sánchez', 'Romero'];
    const ciudades = ['Avellaneda', 'Lanús', 'Quilmes', 'Banfield'];
    const categorias = ['pizzas', 'hamburguesas', 'empanadas', 'sushi', 'pastas'];

    const clientes = [];

    for (let i = 0; i < 35; i++) {
      const nombre = elegirAlAzar(nombres);
      const apellido = elegirAlAzar(apellidos);
      const ciudad = elegirAlAzar(ciudades);

      clientes.push({
        nombre,
        apellido,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@mail.com`,
        telefono: `11-${numeroAlAzar(4000, 6999)}-${numeroAlAzar(1000, 9999)}`,
        ciudad,
        fechaAlta: new Date(2026, numeroAlAzar(0, 8), numeroAlAzar(1, 28)),
        direcciones: [
          {
            alias: 'Casa',
            calle: `Av. Mitre ${numeroAlAzar(100, 4000)}`,
            pisoDepto: i % 2 === 0 ? `${numeroAlAzar(1, 6)}B` : 'PB',
            barrio: 'Centro',
            ciudad,
            codigoPostal: '1870'
          }
        ],
        preferencias: {
          categoriaFavorita: elegirAlAzar(categorias),
          recibePromosWhatsApp: i % 2 === 0
        }
      });
    }

    const resClientes = await db.collection('clientes').insertMany(clientes);
    await db.collection('clientes').createIndex({ email: 1 }, { unique: true });

    const clientesConId = clientes.map((cliente, indice) => ({
      ...cliente,
      _id: resClientes.insertedIds[indice]
    }));

    // 3. COLECCIÓN 2: RESTAURANTES (30 documentos con menú embebido)
    const platosPorCategoria = {
      pizzas: ['Pizza Muzza Especial', 'Pizza Napolitana', 'Fugazzeta Rellena', 'Pizza Calabresa'],
      hamburguesas: ['Doble Cheddar Bacon', 'Clásica Americana', 'Crispy Onion Burger', 'Veggie Provo'],
      empanadas: ['Docena Carne Suave', 'Docena Jamón y Queso', 'Media Docena Pollo', 'Empanada Caprese'],
      sushi: ['Combinado 20 Piezas', 'Roll Philadelphia', 'Roll Buenos Aires', 'Niguiri Salmón x6'],
      pastas: ['Sorrentinos Jamón y Queso', 'Tallarines con Bolognesa', 'Ñoquis de Papa', 'Lasagna Casera']
    };

    const restaurantes = [];

    for (let i = 0; i < 30; i++) {
      const categoria = categorias[i % categorias.length];
      const nombresPlatos = platosPorCategoria[categoria];

      const menu = [];
      for (let j = 0; j < nombresPlatos.length; j++) {
        menu.push({
          platoId: new ObjectId(),
          nombre: nombresPlatos[j],
          categoriaPlato: categoria,
          precio: numeroAlAzar(70, 180) * 100,
          descripcion: `Especialidad de la casa: ${nombresPlatos[j]}`,
          disponible: true
        });
      }

      restaurantes.push({
        nombre: `Local ${categoria.toUpperCase()} #${i + 1}`,
        categoria,
        ciudad: elegirAlAzar(ciudades),
        direccion: `San Martín ${numeroAlAzar(200, 3500)}`,
        calificacion: Number((Math.random() * (5.0 - 3.8) + 3.8).toFixed(1)),
        tiempoEstimadoMin: numeroAlAzar(25, 50),
        costoEnvio: numeroAlAzar(6, 15) * 100,
        activo: true,
        menu
      });
    }

    const resRestaurantes = await db.collection('restaurantes').insertMany(restaurantes);

    const restaurantesConId = restaurantes.map((rest, indice) => ({
      ...rest,
      _id: resRestaurantes.insertedIds[indice]
    }));

    // 4. COLECCIÓN 3: PEDIDOS (60 documentos con Referencing + Snapshot)
    const metodosPago = ['mercadopago', 'efectivo', 'tarjeta_debito', 'tarjeta_credito'];
    const estados = ['entregado', 'entregado', 'entregado', 'en_camino', 'cancelado'];
    const pedidos = [];

    for (let i = 0; i < 60; i++) {
      const cliente = elegirAlAzar(clientesConId);
      const restaurante = elegirAlAzar(restaurantesConId);
      const estado = elegirAlAzar(estados);

      const platosSeleccionados = [restaurante.menu[0]];
      if (i % 2 === 0) {
        platosSeleccionados.push(restaurante.menu[1]);
      }

      const items = [];
      let subtotalPedido = 0;

      for (let k = 0; k < platosSeleccionados.length; k++) {
        const plato = platosSeleccionados[k];
        const cantidad = numeroAlAzar(1, 3);
        const subtotalItem = plato.precio * cantidad;
        subtotalPedido += subtotalItem;

        items.push({
          platoId: plato.platoId,
          nombrePlato: plato.nombre,
          precioUnitario: plato.precio,
          cantidad,
          subtotal: subtotalItem,
          aclaraciones: i % 4 === 0 ? 'Sin cebolla' : ''
        });
      }

      const direccionCliente = cliente.direcciones[0];

      pedidos.push({
        numeroPedido: `DELIV-2026-${String(i + 1).padStart(4, '0')}`,
        clienteId: cliente._id,
        restauranteId: restaurante._id,
        fecha: new Date(2026, numeroAlAzar(8, 10), numeroAlAzar(1, 28), numeroAlAzar(19, 23)),
        estado,
        metodoPago: elegirAlAzar(metodosPago),
        items,
        subtotal: subtotalPedido,
        costoEnvio: restaurante.costoEnvio,
        total: subtotalPedido + restaurante.costoEnvio,
        tiempoEntregaMin: estado === 'entregado' ? numeroAlAzar(22, 60) : null,
        direccionEntrega: {
          calle: direccionCliente.calle,
          pisoDepto: direccionCliente.pisoDepto,
          ciudad: direccionCliente.ciudad
        }
      });
    }

    const resPedidos = await db.collection('pedidos').insertMany(pedidos);

    console.log('Carga inicial completada:');
    console.log(`- Clientes: ${resClientes.insertedCount}`);
    console.log(`- Restaurantes: ${resRestaurantes.insertedCount}`);
    console.log(`- Pedidos: ${resPedidos.insertedCount}`);
  } finally {
    await closeDB();
  }
}

seed().catch(console.error);
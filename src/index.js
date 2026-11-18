import { connectDB, closeDB } from './config/db.js';
import {
  getVentasPorCategoria,
  getTopPlatosMasVendidos,
  getClientesFrecuentes
} from './queries/pipelines.js';

async function main() {
  const db = await connectDB();

  try {
    console.log('\n=== 1. VENTAS POR CATEGORÍA ===');
    const ventas = await getVentasPorCategoria(db);
    console.table(ventas);

    console.log('\n=== 2. TOP 5 PLATOS MÁS VENDIDOS ===');
    const topPlatos = await getTopPlatosMasVendidos(db);
    console.table(topPlatos);

    console.log('\n=== 3. CLIENTES FRECUENTES (2 O MÁS PEDIDOS) ===');
    const frecuentes = await getClientesFrecuentes(db);
    console.table(frecuentes);
  } finally {
    await closeDB();
  }
}

main().catch(console.error);
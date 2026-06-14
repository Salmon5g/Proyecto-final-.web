// IMPORTANTE: debe estar ANTES de cualquier require que use pg/sequelize
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app       = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// 1️⃣  Arrancar el servidor PRIMERO para que Railway detecte el puerto
//     Si lo hacemos después de authenticate(), Railway mata el proceso
//     porque nunca ve el puerto abierto (health-check timeout ~5s).
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// 2️⃣  Conectar a la BD con un timeout de 10 s para que no se cuelgue
async function connectDB() {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Timeout: la BD no respondió en 10 segundos')),
      10_000
    )
  );

  try {
    await Promise.race([sequelize.authenticate(), timeout]);
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:');
    console.error('   Mensaje :', err.message);
    console.error('   Código  :', err.code   || 'N/A');
    console.error('   Stack   :', err.stack);
    // No cerramos el servidor — Railway seguirá mostrando los logs
    // y podremos ver el error real antes de decidir qué hacer.
  }
}

connectDB();
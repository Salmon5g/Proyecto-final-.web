// IMPORTANTE: debe estar ANTES de cualquier require que use pg/sequelize
// Evita fallo de TLS handshake en Railway con pg 8.x + Node 20
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code || 'N/A');
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

startServer();
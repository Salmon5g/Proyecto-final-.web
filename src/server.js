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
    // Log completo para diagnóstico en Railway
    console.error('❌ No se pudo conectar a la base de datos:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code || 'N/A');
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

startServer();
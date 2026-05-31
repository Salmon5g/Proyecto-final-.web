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
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

startServer();
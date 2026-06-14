// IMPORTANTE: debe estar ANTES de cualquier require que use pg
// Evita fallo de TLS handshake en Railway con pg 8.x + Node 20
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: console.log,
      dialectOptions: { charset: 'utf8mb4' },
      define: { timestamps: true, underscored: true },
    }
  );
}

module.exports = sequelize;
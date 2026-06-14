// IMPORTANTE: debe estar ANTES de cualquier require que use pg
// Evita fallo de TLS handshake en Railway con pg 8.x + Node 20
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';

module.exports = {
  development: {
    url: dbUrl,
    dialect: 'mysql',
    dialectOptions: { charset: 'utf8mb4' },
    define: { timestamps: true, underscored: true },
  },
  production: {
    url: dbUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    define: { timestamps: true, underscored: true },
  },
};
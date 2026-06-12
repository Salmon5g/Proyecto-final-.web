require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const dialect = dbUrl.startsWith('postgresql') || dbUrl.startsWith('postgres')
  ? 'postgres'
  : 'mysql';

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
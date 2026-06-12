const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const dialect = dbUrl.startsWith('postgresql') || dbUrl.startsWith('postgres')
  ? 'postgres'
  : 'mysql';

const dialectOptions = dialect === 'postgres'
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : { charset: 'utf8mb4' };

const sequelize = new Sequelize(dbUrl, {
  dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
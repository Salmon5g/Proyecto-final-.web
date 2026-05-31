const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    charset: 'utf8mb4',
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
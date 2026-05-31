require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
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
  },
};
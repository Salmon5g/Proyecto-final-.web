'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plaza = sequelize.define('Plaza', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  tipo: {
    type: DataTypes.ENUM('normal', 'discapacitado', 'moto'),
    defaultValue: 'normal',
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('libre', 'ocupada', 'reservada', 'mantenimiento'),
    defaultValue: 'libre',
    allowNull: false,
  },
  planta: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
}, {
  tableName: 'plazas',
  underscored: true,
});

Plaza.associate = (models) => {
  Plaza.hasMany(models.Registro, { foreignKey: 'plaza_id', as: 'registros' });
};

module.exports = Plaza;
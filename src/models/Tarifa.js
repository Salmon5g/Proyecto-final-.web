'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarifa = sequelize.define('Tarifa', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre:        { type: DataTypes.STRING(100), allowNull: false },
  precio_hora:   { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tipo_vehiculo: { type: DataTypes.ENUM('normal', 'discapacitado', 'moto'), defaultValue: 'normal' },
  activa:        { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'tarifas',
  underscored: true,
});

module.exports = Tarifa;
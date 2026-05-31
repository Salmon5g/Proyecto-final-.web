'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registro = sequelize.define('Registro', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matricula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { notEmpty: true },
  },
  entrada: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  salida: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  plaza_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tarifa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'registros',
  underscored: true,
});

Registro.associate = (models) => {
  Registro.belongsTo(models.Plaza, { foreignKey: 'plaza_id', as: 'plaza' });
};

module.exports = Registro;
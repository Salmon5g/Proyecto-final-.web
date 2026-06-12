'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  token:      { type: DataTypes.STRING(64), allowNull: false, unique: true },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used:       { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'password_reset_tokens',
  underscored: true,
});

module.exports = PasswordResetToken;
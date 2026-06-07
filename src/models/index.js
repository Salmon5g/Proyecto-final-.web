'use strict';
const Plaza    = require('./Plaza');
const Registro = require('./Registro');
const Tarifa   = require('./Tarifa');
const Usuario  = require('./Usuario');

// Asociaciones Plaza ↔ Registro
Plaza.hasMany(Registro,   { foreignKey: 'plaza_id', as: 'registros' });
Registro.belongsTo(Plaza, { foreignKey: 'plaza_id', as: 'plaza' });

// Asociaciones Tarifa ↔ Registro
Tarifa.hasMany(Registro,   { foreignKey: 'tarifa_id', as: 'registros' });
Registro.belongsTo(Tarifa, { foreignKey: 'tarifa_id', as: 'tarifa' });

module.exports = { Plaza, Registro, Tarifa, Usuario };
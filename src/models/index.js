'use strict';
const Plaza    = require('./Plaza');
const Registro = require('./Registro');

// Activar asociaciones
Plaza.hasMany(Registro,    { foreignKey: 'plaza_id', as: 'registros' });
Registro.belongsTo(Plaza,  { foreignKey: 'plaza_id', as: 'plaza' });

module.exports = { Plaza, Registro };
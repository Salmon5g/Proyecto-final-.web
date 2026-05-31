'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plazas', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      tipo: { type: Sequelize.ENUM('normal', 'discapacitado', 'moto'), defaultValue: 'normal' },
      estado: { type: Sequelize.ENUM('libre', 'ocupada', 'reservada', 'mantenimiento'), defaultValue: 'libre' },
      planta: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('plazas');
  },
};
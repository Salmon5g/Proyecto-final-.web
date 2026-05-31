'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tarifas', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      precio_hora: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tipo_vehiculo: { type: Sequelize.ENUM('coche', 'moto', 'furgoneta'), defaultValue: 'coche' },
      activa: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tarifas');
  },
};
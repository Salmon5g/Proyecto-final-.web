'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registros', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      matricula: { type: Sequelize.STRING(20), allowNull: false },
      entrada: { type: Sequelize.DATE, allowNull: false },
      salida: { type: Sequelize.DATE, allowNull: true },
      importe: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      plaza_id: {
        type: Sequelize.INTEGER,
        references: { model: 'plazas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      tarifa_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tarifas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('registros');
  },
};
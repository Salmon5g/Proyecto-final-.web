'use strict';

/**
 * Migration: rename `precio_hora` → `precio_minuto` in the `tarifas` table.
 * Compatible con MySQL (local) y PostgreSQL (Railway).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TABLE tarifas RENAME COLUMN precio_hora TO precio_minuto;
      `);
    } else {
      // MySQL: CHANGE COLUMN requiere repetir la definición completa
      await queryInterface.sequelize.query(`
        ALTER TABLE tarifas
        CHANGE precio_hora precio_minuto DECIMAL(10, 2) NOT NULL;
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TABLE tarifas RENAME COLUMN precio_minuto TO precio_hora;
      `);
    } else {
      await queryInterface.sequelize.query(`
        ALTER TABLE tarifas
        CHANGE precio_minuto precio_hora DECIMAL(10, 2) NOT NULL;
      `);
    }
  },
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    // En PostgreSQL (Railway) la BD es nueva, el ENUM ya viene correcto
    // desde create-tarifas. Solo aplicamos el fix en MySQL (local).
    if (dialect === 'postgres') return;

    // 1. Loosen the column to VARCHAR so we can freely update values
    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
      MODIFY tipo_vehiculo VARCHAR(50) NOT NULL DEFAULT 'normal'
    `);

    // 2. Remap old values
    await queryInterface.sequelize.query(`
      UPDATE tarifas
      SET tipo_vehiculo = CASE
        WHEN tipo_vehiculo = 'coche'     THEN 'normal'
        WHEN tipo_vehiculo = 'furgoneta' THEN 'normal'
        WHEN tipo_vehiculo = 'moto'      THEN 'moto'
        ELSE 'normal'
      END
    `);

    // 3. Lock it back down to the new ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
      MODIFY tipo_vehiculo ENUM('normal', 'discapacitado', 'moto') NOT NULL DEFAULT 'normal'
    `);
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'postgres') return;

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
      MODIFY tipo_vehiculo VARCHAR(50) NOT NULL DEFAULT 'coche'
    `);

    await queryInterface.sequelize.query(`
      UPDATE tarifas
      SET tipo_vehiculo = CASE
        WHEN tipo_vehiculo = 'normal'        THEN 'coche'
        WHEN tipo_vehiculo = 'discapacitado' THEN 'coche'
        WHEN tipo_vehiculo = 'moto'          THEN 'moto'
        ELSE 'coche'
      END
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
      MODIFY tipo_vehiculo ENUM('coche', 'moto', 'furgoneta') NOT NULL DEFAULT 'coche'
    `);
  },
};
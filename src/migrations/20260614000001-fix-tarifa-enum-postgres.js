'use strict';

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    // Solo aplica en PostgreSQL (Railway)
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas ALTER COLUMN tipo_vehiculo TYPE VARCHAR(50);
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_tarifas_tipo_vehiculo;
    `);

    await queryInterface.sequelize.query(`
      UPDATE tarifas
      SET tipo_vehiculo = CASE
        WHEN tipo_vehiculo = 'coche'     THEN 'normal'
        WHEN tipo_vehiculo = 'furgoneta' THEN 'normal'
        ELSE tipo_vehiculo
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE enum_tarifas_tipo_vehiculo
        AS ENUM ('normal', 'discapacitado', 'moto');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
        ALTER COLUMN tipo_vehiculo
        TYPE enum_tarifas_tipo_vehiculo
        USING tipo_vehiculo::enum_tarifas_tipo_vehiculo;
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas ALTER COLUMN tipo_vehiculo TYPE VARCHAR(50);
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_tarifas_tipo_vehiculo;
    `);

    await queryInterface.sequelize.query(`
      UPDATE tarifas
      SET tipo_vehiculo = CASE
        WHEN tipo_vehiculo = 'normal'        THEN 'coche'
        WHEN tipo_vehiculo = 'discapacitado' THEN 'coche'
        ELSE tipo_vehiculo
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE enum_tarifas_tipo_vehiculo
        AS ENUM ('coche', 'moto', 'furgoneta');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tarifas
        ALTER COLUMN tipo_vehiculo
        TYPE enum_tarifas_tipo_vehiculo
        USING tipo_vehiculo::enum_tarifas_tipo_vehiculo;
    `);
  },
};
'use strict';

/** AC — Agregar campo tipo_pago a registros
 *
 * Motivo: registrar el método de pago utilizado al cerrar cada estancia
 * (efectivo, tarjeta o pago por app).  El valor por defecto 'efectivo'
 * mantiene la compatibilidad con los registros previos.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('registros', 'tipo_pago', {
      type: Sequelize.ENUM('efectivo', 'tarjeta', 'app'),
      allowNull: false,
      defaultValue: 'efectivo',
      after: 'importe',   
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('registros', 'tipo_pago');
    
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_registros_tipo_pago";'
    );
  },
};
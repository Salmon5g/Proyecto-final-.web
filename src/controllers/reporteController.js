const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

const reportePorZona = async (req, res) => {
  const { desde, hasta } = req.query;

  const filtros = [];
  const reemplazos = {};

  if (desde) {
    filtros.push('r.entrada >= :desde');
    reemplazos.desde = desde + ' 00:00:00';
  }
  if (hasta) {
    filtros.push('r.entrada <= :hasta');
    reemplazos.hasta = hasta + ' 23:59:59';
  }

  const where = filtros.length > 0
    ? 'WHERE r.salida IS NOT NULL AND ' + filtros.join(' AND ')
    : 'WHERE r.salida IS NOT NULL';

  const sql = `
   SELECT
   p.planta AS zona,
   COUNT(r.id) AS total_registros,
   SUM(r.importe) AS ingresos_totales,
   AVG(
    EXTRACT(EPOCH FROM (r.salida - r.entrada)) / 60
   ) AS promedio_minutos
  FROM registros r
  JOIN plazas p ON r.plaza_id = p.id
  ${where}
  GROUP BY p.planta
  ORDER BY p.planta ASC
  `;

  const zonas = await sequelize.query(sql, {
    replacements: reemplazos,
    type: QueryTypes.SELECT,
  });

  const totales = {
    total_registros: zonas.reduce((sum, z) => sum + Number(z.total_registros), 0),
    ingresos_totales: zonas.reduce((sum, z) => sum + Number(z.ingresos_totales || 0), 0),
  };

  res.json({ ok: true, data: { zonas, totales } });
};

module.exports = { reportePorZona };
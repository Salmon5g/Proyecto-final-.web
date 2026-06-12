const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

const reportePorZona = async (req, res) => {
  const { desde, hasta } = req.query;

  const filtros = [];
  const reemplazos = {};

  if (desde) {
    filtros.push('r.fecha_entrada >= :desde');
    reemplazos.desde = desde + ' 00:00:00';
  }
  if (hasta) {
    filtros.push('r.fecha_entrada <= :hasta');
    reemplazos.hasta = hasta + ' 23:59:59';
  }

  const where = filtros.length > 0
    ? 'WHERE r.fecha_salida IS NOT NULL AND ' + filtros.join(' AND ')
    : 'WHERE r.fecha_salida IS NOT NULL';

  const sql = `
    SELECT
      p.planta AS zona,
      COUNT(r.id) AS total_registros,
      SUM(r.monto_cobrado) AS ingresos_totales,
      AVG(
        TIMESTAMPDIFF(MINUTE, r.fecha_entrada, r.fecha_salida)
      ) AS duracion_promedio_minutos
    FROM registros r
    JOIN plazas p ON r.plaza_id = p.id
    ${where}
    GROUP BY p.planta
    ORDER BY p.planta ASC
  `;

  const resultados = await sequelize.query(sql, {
    replacements: reemplazos,
    type: QueryTypes.SELECT,
  });

  res.json({ ok: true, data: resultados });
};

module.exports = { reportePorZona };
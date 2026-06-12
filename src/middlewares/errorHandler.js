'use strict';

function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';

  // ── Errores Sequelize ──────────────────────────────────────
  // Validación de modelo (campo inválido, null no permitido, etc.)
  if (err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors
      ? err.errors.map(e => e.message).join(', ')
      : err.message;

    return res.status(err.name === 'SequelizeUniqueConstraintError' ? 409 : 422).json({
      ok: false,
      message: messages,
      code: err.name,
    });
  }

  // Clave foránea inválida
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      ok: false,
      message: 'Referencia inválida: el recurso relacionado no existe.',
      code: err.name,
    });
  }

  // Error de conexión a la BD
  if (err.name === 'SequelizeConnectionError' ||
      err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({
      ok: false,
      message: 'Base de datos no disponible. Intenta más tarde.',
      code: err.name,
    });
  }

  // ── Errores con statusCode explícito (lanzados manualmente) ──
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message || 'Error en la solicitud.',
    });
  }

  // ── Error genérico 500 ────────────────────────────────────
  if (!isProd) {
    // En desarrollo: muestra el stack completo en consola
    console.error('[ERROR]', err.stack || err);
  }

  return res.status(500).json({
    ok: false,
    message: isProd
      ? 'Error interno del servidor.'
      : err.message || 'Error interno del servidor.',
  });
}

module.exports = errorHandler;
'use strict';
const { Registro, Plaza, Tarifa } = require('../models');

// GET /api/v1/registros
const getAll = async (req, res) => {
  try {
    const registros = await Registro.findAll({
      include: [{ model: Plaza, as: 'plaza', attributes: ['id', 'codigo'] }],
      order: [['entrada', 'DESC']],
    });
    res.json({ ok: true, data: registros });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /api/v1/registros/activos
const getActivos = async (req, res) => {
  try {
    const activos = await Registro.findAll({
      where: { salida: null },
      include: [{ model: Plaza, as: 'plaza', attributes: ['id', 'codigo'] }],
      order: [['entrada', 'DESC']],
    });
    res.json({ ok: true, data: activos });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /api/v1/registros/:id
const getById = async (req, res) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    res.json({ ok: true, data: registro });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/registros/entrada
const registrarEntrada = async (req, res) => {
  try {
    const { matricula, plaza_id } = req.body;
    if (!matricula || !matricula.trim())
      return res.status(400).json({ ok: false, message: 'La matrícula es obligatoria' });

    if (plaza_id) {
      const plaza = await Plaza.findByPk(plaza_id);
      if (!plaza) return res.status(404).json({ ok: false, message: 'Plaza no encontrada' });
      if (plaza.estado === 'ocupada') return res.status(409).json({ ok: false, message: 'La plaza ya está ocupada' });
      await plaza.update({ estado: 'ocupada' });
    }

    const registro = await Registro.create({
      matricula: matricula.trim().toUpperCase(),
      plaza_id: plaza_id || null,
      entrada: new Date(),
    });

    res.status(201).json({ ok: true, data: registro });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// PUT /api/v1/registros/:id/salida
const registrarSalida = async (req, res) => {
  try {
    const TIPOS_PAGO_VALIDOS = ['efectivo', 'tarjeta', 'app'];
    const tipo_pago = req.body.tipo_pago || 'efectivo';

    if (!TIPOS_PAGO_VALIDOS.includes(tipo_pago)) {
      return res.status(422).json({
        ok: false,
        message: `tipo_pago inválido. Valores permitidos: ${TIPOS_PAGO_VALIDOS.join(', ')}`,
      });
    }

    const registro = await Registro.findByPk(req.params.id, {
      include: [{ model: Plaza, as: 'plaza' }],
    });
    if (!registro) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    if (registro.salida) return res.status(409).json({ ok: false, message: 'El vehículo ya registró salida' });

    let tarifa = await Tarifa.findOne({
      where: { activa: true, tipo_vehiculo: registro.plaza?.tipo || 'normal' },
    });
    if (!tarifa) tarifa = await Tarifa.findOne({ where: { activa: true } });

    const precioPorMinuto = tarifa ? parseFloat(tarifa.precio_minuto) : 10;
    const tarifa_id       = tarifa ? tarifa.id : null;

    const salida   = new Date();
    const entrada  = new Date(registro.entrada);
    const minutos  = Math.max(1, Math.ceil((salida - entrada) / (1000 * 60)));
    const importe  = (minutos * precioPorMinuto).toFixed(2);

    await registro.update({ salida, importe, tarifa_id, tipo_pago });

    if (registro.plaza) await registro.plaza.update({ estado: 'libre' });

    res.json({
      ok: true,
      data: {
        ...registro.toJSON(),
        minutos,
        precio_minuto: precioPorMinuto,
        tarifa_nombre: tarifa?.nombre || 'Tarifa base',
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// DELETE /api/v1/registros/:id
const remove = async (req, res) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });

    if (!registro.salida)
      return res.status(409).json({ ok: false, message: 'No se puede eliminar un registro activo. Registra la salida primero' });

    await registro.destroy();
    res.json({ ok: true, message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getAll, getActivos, getById, registrarEntrada, registrarSalida, remove };
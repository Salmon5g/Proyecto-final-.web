'use strict';
const Registro = require('../models/Registro');
const Plaza = require('../models/Plaza');

// GET /api/v1/registros  — todos los registros
const getAll = async (req, res) => {
  try {
    const registros = await Registro.findAll({
      order: [['entrada', 'DESC']],
    });
    res.json({ ok: true, data: registros });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /api/v1/registros/activos  — vehículos que aún no han salido
const getActivos = async (req, res) => {
  try {
    const activos = await Registro.findAll({
      where: { salida: null },
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

// POST /api/v1/registros/entrada  — registrar entrada de vehículo
const registrarEntrada = async (req, res) => {
  try {
    const { matricula, plaza_id } = req.body;
    if (!matricula) return res.status(400).json({ ok: false, message: 'La matrícula es obligatoria' });

    // Marcar plaza como ocupada si se proporcionó
    if (plaza_id) {
      const plaza = await Plaza.findByPk(plaza_id);
      if (!plaza) return res.status(404).json({ ok: false, message: 'Plaza no encontrada' });
      if (plaza.estado === 'ocupada') return res.status(409).json({ ok: false, message: 'La plaza ya está ocupada' });
      await plaza.update({ estado: 'ocupada' });
    }

    const registro = await Registro.create({
      matricula,
      plaza_id: plaza_id || null,
      entrada: new Date(),
    });

    res.status(201).json({ ok: true, data: registro });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// PUT /api/v1/registros/:id/salida  — registrar salida y calcular importe
const registrarSalida = async (req, res) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    if (registro.salida) return res.status(409).json({ ok: false, message: 'Este vehículo ya registró salida' });

    const salida = new Date();
    const entrada = new Date(registro.entrada);

    // Calcular horas (mínimo 1 hora)
    const horas = Math.max(1, Math.ceil((salida - entrada) / (1000 * 60 * 60)));

    // Tarifa base: 2.50€/hora (se puede hacer configurable después con RQ-02 tarifas)
    const precioPorHora = 2.50;
    const importe = (horas * precioPorHora).toFixed(2);

    await registro.update({ salida, importe });

    // Liberar la plaza
    if (registro.plaza_id) {
      const plaza = await Plaza.findByPk(registro.plaza_id);
      if (plaza) await plaza.update({ estado: 'libre' });
    }

    res.json({ ok: true, data: registro, horas, importe });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// DELETE /api/v1/registros/:id
const remove = async (req, res) => {
  try {
    const registro = await Registro.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
    await registro.destroy();
    res.json({ ok: true, message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getAll, getActivos, getById, registrarEntrada, registrarSalida, remove };
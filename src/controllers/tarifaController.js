'use strict';
const { Tarifa } = require('../models');

// GET /api/v1/tarifas
const getAll = async (req, res) => {
  try {
    const tarifas = await Tarifa.findAll({ order: [['nombre', 'ASC']] });
    res.json({ ok: true, data: tarifas });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /api/v1/tarifas/:id
const getOne = async (req, res) => {
  try {
    const tarifa = await Tarifa.findByPk(req.params.id);
    if (!tarifa) return res.status(404).json({ ok: false, message: 'Tarifa no encontrada' });
    res.json({ ok: true, data: tarifa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/tarifas
const create = async (req, res) => {
  try {
    const { nombre, precio_hora, tipo_vehiculo, activa } = req.body;
    if (!nombre || precio_hora == null)
      return res.status(422).json({ ok: false, message: 'nombre y precio_hora son obligatorios' });
    const tarifa = await Tarifa.create({ nombre, precio_hora, tipo_vehiculo, activa });
    res.status(201).json({ ok: true, data: tarifa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// PUT /api/v1/tarifas/:id
const update = async (req, res) => {
  try {
    const tarifa = await Tarifa.findByPk(req.params.id);
    if (!tarifa) return res.status(404).json({ ok: false, message: 'Tarifa no encontrada' });
    const { nombre, precio_hora, tipo_vehiculo, activa } = req.body;
    await tarifa.update({ nombre, precio_hora, tipo_vehiculo, activa });
    res.json({ ok: true, data: tarifa });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// DELETE /api/v1/tarifas/:id
const remove = async (req, res) => {
  try {
    const tarifa = await Tarifa.findByPk(req.params.id);
    if (!tarifa) return res.status(404).json({ ok: false, message: 'Tarifa no encontrada' });
    await tarifa.destroy();
    res.json({ ok: true, message: 'Tarifa eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
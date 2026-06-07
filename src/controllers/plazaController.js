'use strict';
const { Plaza } = require('../models');

// GET /api/v1/plazas
const getAll = async (req, res) => {
  try {
    const plazas = await Plaza.findAll();
    res.json({ ok: true, data: plazas });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /api/v1/plazas/:id
const getById = async (req, res) => {
  try {
    const plaza = await Plaza.findByPk(req.params.id);
    if (!plaza) return res.status(404).json({ ok: false, message: 'Plaza no encontrada' });
    res.json({ ok: true, data: plaza });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/plazas
const create = async (req, res) => {
  try {
    const { codigo, tipo, estado, planta } = req.body;
    if (!codigo) return res.status(400).json({ ok: false, message: 'El campo código es obligatorio' });
    const plaza = await Plaza.create({ codigo, tipo, estado, planta });
    res.status(201).json({ ok: true, data: plaza });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ ok: false, message: 'Ya existe una plaza con ese código' });
    }
    res.status(500).json({ ok: false, message: error.message });
  }
};

// PUT /api/v1/plazas/:id
const update = async (req, res) => {
  try {
    const plaza = await Plaza.findByPk(req.params.id);
    if (!plaza) return res.status(404).json({ ok: false, message: 'Plaza no encontrada' });
    const { codigo, tipo, estado, planta } = req.body;
    await plaza.update({ codigo, tipo, estado, planta });
    res.json({ ok: true, data: plaza });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// DELETE /api/v1/plazas/:id
const remove = async (req, res) => {
  try {
    const plaza = await Plaza.findByPk(req.params.id);
    if (!plaza) return res.status(404).json({ ok: false, message: 'Plaza no encontrada' });
    await plaza.destroy();
    res.json({ ok: true, message: 'Plaza eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
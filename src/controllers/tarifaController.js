'use strict';
const { Tarifa } = require('../models');
const TIPOS_VEHICULO = ['normal', 'discapacitado', 'moto'];

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
    const { nombre, precio_minuto, tipo_vehiculo, activa } = req.body;

    if (!nombre || !nombre.trim())
      return res.status(400).json({ ok: false, message: 'El campo nombre es obligatorio' });

    if (precio_minuto == null)
      return res.status(422).json({ ok: false, message: 'El campo precio_minuto es obligatorio' });

    if (isNaN(Number(precio_minuto)) || Number(precio_minuto) <= 0)
      return res.status(422).json({ ok: false, message: 'precio_minuto debe ser un número mayor que 0' });

    if (tipo_vehiculo && !TIPOS_VEHICULO.includes(tipo_vehiculo))
      return res.status(422).json({ ok: false, message: `tipo_vehiculo inválido. Valores permitidos: ${TIPOS_VEHICULO.join(', ')}` });

    const tarifa = await Tarifa.create({ nombre: nombre.trim(), precio_minuto, tipo_vehiculo, activa });
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

    const { nombre, precio_minuto, tipo_vehiculo, activa } = req.body;

    if (precio_minuto != null && (isNaN(Number(precio_minuto)) || Number(precio_minuto) <= 0))
      return res.status(422).json({ ok: false, message: 'precio_minuto debe ser un número mayor que 0' });

    if (tipo_vehiculo && !TIPOS_VEHICULO.includes(tipo_vehiculo))
      return res.status(422).json({ ok: false, message: `tipo_vehiculo inválido. Valores permitidos: ${TIPOS_VEHICULO.join(', ')}` });

    await tarifa.update({ nombre, precio_minuto, tipo_vehiculo, activa });
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

    const { Registro } = require('../models');
    const enUso = await Registro.count({ where: { tarifa_id: tarifa.id } });
    if (enUso > 0)
      return res.status(409).json({ ok: false, message: `No se puede eliminar: la tarifa está asociada a ${enUso} registro(s)` });

    await tarifa.destroy();
    res.json({ ok: true, message: 'Tarifa eliminada' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
'use strict';
const express = require('express');
const router = express.Router();
const {
  getAll,
  getActivos,
  getById,
  registrarEntrada,
  registrarSalida,
  remove,
} = require('../controllers/registroController');

router.get('/',           getAll);
router.get('/activos',    getActivos);
router.get('/:id',        getById);
router.post('/entrada',   registrarEntrada);
router.put('/:id/salida', registrarSalida);
router.delete('/:id',     remove);

module.exports = router;
'use strict';
const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getOcupacion } = require('../controllers/plazaController');

router.get('/ocupacion', getOcupacion);   // ← NUEVA, antes de /:id
router.get('/',          getAll);
router.get('/:id',       getById);
router.post('/',         create);
router.put('/:id',       update);
router.delete('/:id',    remove);

module.exports = router;
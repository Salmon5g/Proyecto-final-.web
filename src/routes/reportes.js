'use strict';
const express = require('express');
const router  = express.Router();
const { reportePorZona } = require('../controllers/reporteController');

router.get('/zona', reportePorZona);

module.exports = router;
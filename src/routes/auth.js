'use strict';
const express = require('express');
const router  = express.Router();
const { register, login, solicitarReset, restablecerPassword } = require('../controllers/authController');

router.post('/register',       register);
router.post('/login',          login);
router.post('/reset',          solicitarReset);
router.post('/reset/confirm',  restablecerPassword);

module.exports = router;
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Ruta de salud (health check)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de estacionamiento funcionando 🚗' });
});

module.exports = app;
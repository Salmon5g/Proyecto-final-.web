const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const plazasRouter = require('./routes/plazas');

// Middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api/v1/plazas', plazasRouter);

// Ruta de salud (health check)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de estacionamiento funcionando 🚗' });
});


module.exports = app;
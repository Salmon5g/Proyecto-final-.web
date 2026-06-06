const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const plazasRouter = require('./routes/plazas');
const registrosRouter = require('./routes/registros');
const authRouter = require('./routes/auth');

// Middlewares globales
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api/v1/plazas', plazasRouter);
app.use('/api/v1/registros', registrosRouter);
app.use('/api/v1/auth', authRouter);

// Ruta de salud (health check)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de estacionamiento funcionando 🚗' });
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  credentials: true,
}));

module.exports = app;
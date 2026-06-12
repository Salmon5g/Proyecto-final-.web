'use strict';
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

const plazasRouter   = require('./routes/plazas');
const registrosRouter = require('./routes/registros');
const authRouter     = require('./routes/auth');
const tarifasRouter  = require('./routes/tarifas');
const { authenticate } = require('./middlewares/auth');
const errorHandler   = require('./middlewares/errorHandler');   // ← nuevo
const reportesRouter = require('./routes/reportes');
// Middlewares globales
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
  credentials: true,
}));
app.use(express.json());

// ── Rutas públicas ──────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de estacionamiento funcionando 🚗' });
});
app.use('/api/v1/auth',      authRouter);

// ── Rutas protegidas (requieren JWT) ────────────────────────
app.use('/api/v1/plazas',    authenticate, plazasRouter);
app.use('/api/v1/registros', authenticate, registrosRouter);
app.use('/api/v1/tarifas',   authenticate, tarifasRouter);
app.use('/api/v1/reportes', authenticate, reportesRouter);
// ── 404: ruta no encontrada ─────────────────────────────────
app.use((req, res) => {                                         // ← nuevo
  res.status(404).json({ ok: false, message: `Ruta ${req.method} ${req.url} no encontrada.` });
});

// ── Error handler global (DEBE IR AL FINAL) ─────────────────
app.use(errorHandler);                                          // ← nuevo

module.exports = app;
'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const crypto = require('crypto');
const PasswordResetToken = require('../models/PasswordResetToken');




// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Nombre, email y contraseña son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'Ya existe una cuenta con ese email' });
    }

    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password_hash: hash });

    const { password_hash: _, ...usuarioSinPassword } = usuario.toJSON();
    res.status(201).json({ ok: true, data: usuarioSinPassword });

  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Emitir JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/auth/reset  — solicitar restablecimiento
const solicitarReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, message: 'El email es obligatorio' });

    const usuario = await Usuario.findOne({ where: { email } });
    // Siempre 200 para no revelar si el email existe o no
    if (!usuario) return res.json({ ok: true, message: 'Si el email existe, recibirás el token' });

    // Invalidar tokens anteriores del usuario
    await PasswordResetToken.update(
      { used: true },
      { where: { usuario_id: usuario.id, used: false } }
    );

    // Generar token aleatorio y fecha de expiración (1 hora)
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetToken.create({ usuario_id: usuario.id, token, expires_at: expiresAt });

    // ── MODO DESARROLLO: muestra token en consola ──────────────
    console.log(`\n🔑 [RESET PASSWORD] Email: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Expira: ${expiresAt.toISOString()}\n`);
    // ────────────────────────────────────────────────────────────

    res.json({ ok: true, message: 'Token generado. Revisa la consola del servidor (modo desarrollo).' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /api/v1/auth/reset/confirm  — confirmar token y nueva contraseña
const restablecerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ ok: false, message: 'Token y contraseña son obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ ok: false, message: 'La contraseña debe tener al menos 6 caracteres' });

    const registro = await PasswordResetToken.findOne({ where: { token, used: false } });
    if (!registro) return res.status(400).json({ ok: false, message: 'Token inválido o ya utilizado' });

    if (new Date() > new Date(registro.expires_at))
      return res.status(400).json({ ok: false, message: 'El token ha expirado' });

    const hash = await bcrypt.hash(password, 10);
    await Usuario.update({ password_hash: hash }, { where: { id: registro.usuario_id } });
    await registro.update({ used: true });

    res.json({ ok: true, message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

module.exports = { register, login, solicitarReset, restablecerPassword };
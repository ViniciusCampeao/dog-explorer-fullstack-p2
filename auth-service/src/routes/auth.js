import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import redis from '../config/redis.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn(`[auth-service] Falha de login (usuário inexistente): ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`[auth-service] Falha de login (senha incorreta): ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`[auth-service] Login bem-sucedido: ${username}`);
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint consumido pelo resource-service para validar tokens (comunicação entre serviços).
router.post('/verify', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Token required' });
  }

  const token = auth.slice(7);

  try {
    const blacklisted = await redis.get(`bl:${token}`);
    if (blacklisted) {
      return res.status(401).json({ valid: false, error: 'Token invalidated' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: { id: decoded.id, username: decoded.username } });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

router.post('/logout', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = auth.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.set(`bl:${token}`, '1', 'EX', ttl);
    }
    console.log(`[auth-service] Logout: ${decoded.username}`);
    res.json({ message: 'Logged out' });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Dog from '../models/Dog.js';
import redis from '../config/redis.js';

const router = Router();
const CACHE_KEY = 'dogs:list';
const CHANNEL = 'dog-events';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Valida o token consultando o auth-service (fonte de verdade do token + blacklist).
// Se o auth-service estiver indisponível, degrada para validação local com o
// segredo compartilhado, registrando o incidente (tratamento de erro entre serviços).
async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  const token = header.slice(7);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const r = await fetch(`${AUTH_URL}/auth/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (r.status === 401) {
      return res.status(401).json({ error: 'Invalid or revoked token' });
    }
    if (!r.ok) {
      console.error(`[resource-service] auth-service respondeu status ${r.status}`);
      return res.status(502).json({ error: 'Auth service error' });
    }

    const data = await r.json();
    req.user = data.user;
    return next();
  } catch (err) {
    console.warn(
      `[resource-service] auth-service indisponível (${err.message}); validando token localmente`
    );
    try {
      const blacklisted = await redis.get(`bl:${token}`);
      if (blacklisted) return res.status(401).json({ error: 'Token invalidated' });
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return res.json(JSON.parse(cached));

    const dogs = await Dog.find().sort({ createdAt: -1 });
    await redis.set(CACHE_KEY, JSON.stringify(dogs), 'EX', 60);
    console.log(`[resource-service] Busca por ${req.user.username} (${dogs.length} registros)`);
    res.json(dogs);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, breed, subBreed, imageUrl } = req.body;
  if (!name || !breed) {
    return res.status(400).json({ error: 'name and breed are required' });
  }
  try {
    const dog = await Dog.create({ name, breed, subBreed, imageUrl, ownerId: req.user.id });
    await redis.del(CACHE_KEY);
    await redis.publish(CHANNEL, JSON.stringify({ event: 'created', dog }));
    console.log(`[resource-service] Inserção: "${dog.name}" por ${req.user.username}`);
    res.status(201).json(dog);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Not found' });
    if (dog.ownerId !== req.user.id) {
      console.warn(
        `[resource-service] Update negado (403): ${req.user.username} tentou editar registro de outro dono`
      );
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, breed, subBreed, imageUrl } = req.body;
    if (!name || !breed) {
      return res.status(400).json({ error: 'name and breed are required' });
    }
    dog.name = name;
    dog.breed = breed;
    dog.subBreed = subBreed ?? dog.subBreed;
    dog.imageUrl = imageUrl ?? dog.imageUrl;
    await dog.save();
    await redis.del(CACHE_KEY);
    await redis.publish(CHANNEL, JSON.stringify({ event: 'updated', dog }));
    console.log(`[resource-service] Atualização: "${dog.name}" por ${req.user.username}`);
    res.json(dog);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).json({ error: 'Not found' });
    if (dog.ownerId !== req.user.id) {
      console.warn(
        `[resource-service] Delete negado (403): ${req.user.username} tentou excluir registro de outro dono`
      );
      return res.status(403).json({ error: 'Forbidden' });
    }
    await dog.deleteOne();
    await redis.del(CACHE_KEY);
    await redis.publish(CHANNEL, JSON.stringify({ event: 'deleted', dogId: req.params.id }));
    console.log(`[resource-service] Exclusão: "${dog.name}" por ${req.user.username}`);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Dog from '../models/Dog.js';
import redis from '../config/redis.js';

const router = Router();
const CACHE_KEY = 'dogs:list';
const CHANNEL = 'dog-events';

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  const token = header.slice(7);
  try {
    const blacklisted = await redis.get(`bl:${token}`);
    if (blacklisted) return res.status(401).json({ error: 'Token invalidated' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return res.json(JSON.parse(cached));

    const dogs = await Dog.find().sort({ createdAt: -1 });
    await redis.set(CACHE_KEY, JSON.stringify(dogs), 'EX', 60);
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
      return res.status(403).json({ error: 'Forbidden' });
    }
    await dog.deleteOne();
    await redis.del(CACHE_KEY);
    await redis.publish(CHANNEL, JSON.stringify({ event: 'deleted', dogId: req.params.id }));
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

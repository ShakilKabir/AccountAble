// routes/authRoutes.ts

import express from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { log } from 'console';
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

const router = express.Router();


router.post('/register', async (req, res) => {
  
  try {
    const user = new User(req.body);
    await user.save();
    res.status(200).send({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ message: 'Invalid email or password' });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return res.status(400).send({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, secretKey!);

  res.status(200).send({ token });
});

export default router;

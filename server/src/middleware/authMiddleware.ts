// authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
require('dotenv').config();

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Entered verifyToken middleware');
  
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token as string, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    next();
  });
  
};

export default verifyToken;

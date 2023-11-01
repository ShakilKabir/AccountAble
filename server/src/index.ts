//index.ts

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import chartOfAccountsRoutes from './routes/chartOfAccountsRoutes';
import transactionRoutes from './routes/transactionRoutes';
import financialRatiosRoutes from './routes/financialRatiosRoutes';

const cors = require('cors');

const app = express();

app.use(bodyParser.json());
dotenv.config();

app.use(cors({ origin: "http://localhost:4200" }));

app.options('*', cors());

mongoose.connect('mongodb://127.0.0.1:27017/accounting');

app.use('/api/auth', authRoutes);
app.use('/api/chart-of-accounts', chartOfAccountsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/financial-ratios', financialRatiosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

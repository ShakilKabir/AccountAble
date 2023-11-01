//routes/financialRatiosRoutes.ts

import express from 'express';
import { ChartOfAccounts } from '../models/chartOfAccounts';
import Transaction from '../models/transaction';
import verifyToken from '../middleware/authMiddleware';

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    // Retrieve all necessary data from accounts
    const accounts = await ChartOfAccounts.find({ user_id: userId });

    // Define helper function to find account balance by name
    const getAccountBalance = (name: string) => {
      const account = accounts.find(a => a.account_name === name);
      return account ? account.balance : 0;
    };

    // Calculate specific items
    const cashAtHand = getAccountBalance('Cash');
    const receivables = getAccountBalance('Accounts Receivable');
    const payables = getAccountBalance('Accounts Payable');
    const totalRevenue = accounts.filter(a => a.account_type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = accounts.filter(a => a.account_type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpenses;
    const totalCurrentLiabilities = accounts.filter(a => a.subtype === 'Current Liability').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.account_type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = accounts.filter(a => a.account_type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
    const totalAssets = accounts.filter(a => a.account_type === 'Asset').reduce((sum, a) => sum + a.balance, 0);

    const quickRatio = (cashAtHand + receivables) / totalCurrentLiabilities;
    const debtToEquityRatio = totalLiabilities / totalEquity;
    const profitMargin = netIncome / totalRevenue;
    const returnOnAssets = netIncome / totalAssets;
    const returnOnEquity = netIncome / totalEquity;

    // Send calculated financial metrics in the response
    res.status(200).send({
      cashAtHand,
      receivables,
      payables,
      netIncome,
      quickRatio,
      debtToEquityRatio,
      profitMargin,
      returnOnAssets,
      returnOnEquity
    });

  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

export default router;

// routes/chartOfAccountsRoutes.ts

import express from 'express';
import {ChartOfAccounts} from '../models/chartOfAccounts';
import verifyToken from '../middleware/authMiddleware';
import { initializeDefaultAccounts } from '../models/chartOfAccounts';


const router = express.Router();

router.use(verifyToken); // Place this at the beginning to apply middleware to all routes in this router

router.get('/', async (req, res) => {
  try {
    
    const userId = req.userId;
    if (!userId) {
        return res.status(400).send({ message: 'User ID not provided' });
      }

    // Try fetching accounts
    let accounts = await ChartOfAccounts.find({ user_id: userId });

    // If no accounts are found, create default accounts
    if (!accounts.length) {
      accounts = await initializeDefaultAccounts(userId) as any;
    }

    res.status(200).send(accounts);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const account = new ChartOfAccounts(req.body);
    await account.save();
    res.status(200).send(account);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:account_id', async (req, res) => {
  try {
    const updatedAccount = await ChartOfAccounts.findByIdAndUpdate(req.params.account_id, req.body, { new: true });
    res.status(200).send(updatedAccount);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/:account_id', async (req, res) => {
  // Implement deletion logic (checking for transactions, etc.) before this.
  try {
    await ChartOfAccounts.findByIdAndRemove(req.params.account_id);
    res.status(200).send({ message: 'Account deleted' });
  } catch (err) {
    res.status(400).send(err);
  }
});

export default router;

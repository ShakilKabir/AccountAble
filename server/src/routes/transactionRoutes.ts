//routes/transactionRoutes.ts

import express from 'express';
import Transaction from '../models/transaction';
import verifyToken from '../middleware/authMiddleware';
import { ChartOfAccounts } from '../models/chartOfAccounts';

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ user_id: userId });
    res.status(200).send(transactions);
  } catch (err) {
    res.status(400).send(err);
  }
});



router.post('/', async (req, res) => {

  try {
      const { date, description, debit_account_name, credit_account_name, amount, cash_flow_category, affects_cash } = req.body;
      const { userId } = req;
      
      const debitAccountDocument = await ChartOfAccounts.findOne({ account_name: debit_account_name,user_id:userId });
      const creditAccountDocument = await ChartOfAccounts.findOne({ account_name: credit_account_name, user_id: userId });

      if (!debitAccountDocument || !creditAccountDocument) {
          return res.status(400).send({ message: 'Account not found' });
      }
      const transactionData = {
          date,
          description,
          debit_account_name,
          credit_account_name,
          debit_account_type: debitAccountDocument._id,
          credit_account_type: creditAccountDocument._id,
          amount,
          user_id: userId,
          cash_flow_category,
          affects_cash
      };
      
      const transaction = new Transaction(transactionData);
      await transaction.save();
      res.status(200).send(transaction);
  } catch (err) {
      console.log(err);
      res.status(400).send(err);
  }
});

router.put('/:transaction_id', async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.transaction_id, req.body, { new: true });
    res.status(200).send(updatedTransaction);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/:transaction_id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transaction_id);
    if (!transaction) {
      return res.status(404).send({ message: 'Transaction not found' });
    }
    
    const debitAccount = await ChartOfAccounts.findById(transaction.debit_account_type);
    const creditAccount = await ChartOfAccounts.findById(transaction.credit_account_type);

    if (debitAccount === null || creditAccount === null) {
      return res.status(404).send({ message: 'One or more accounts related to the transaction not found' });
    }
    if (debitAccount.account_type === 'Asset' || debitAccount.account_type === 'Expense') {
      debitAccount.balance -= transaction.amount;
    } else {
      debitAccount.balance += transaction.amount;
    }

    if (creditAccount.account_type === 'Liability' || creditAccount.account_type === 'Equity' || creditAccount.account_type === 'Revenue') {
      creditAccount.balance -= transaction.amount;
    } else {
      creditAccount.balance += transaction.amount;
    }

    await debitAccount.save();
    await creditAccount.save();

    await Transaction.findByIdAndDelete(req.params.transaction_id); 

    res.status(200).send({ message: 'Transaction deleted and account balances updated' });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/income-statement', async (req, res) => {
  try {
      const userId = req.userId;

      const revenueAccounts = await ChartOfAccounts.find({ account_type: 'Revenue', user_id: userId });
      const expenseAccounts = await ChartOfAccounts.find({ account_type: 'Expense', user_id: userId });

      const revenueAccountIds = revenueAccounts.map(account => account._id);
      const expenseAccountIds = expenseAccounts.map(account => account._id);

      const revenueTransactions = await Transaction.find({
          user_id: userId,
          $or: [
              { credit_account_type: { $in: revenueAccountIds } }
          ]
      });
      const expenseTransactions = await Transaction.find({
          user_id: userId,
          $or: [
              { debit_account_type: { $in: expenseAccountIds } }
          ]
      });
      res.status(200).send([revenueTransactions, expenseTransactions]);
  } catch (err) {
      console.log(err);
      res.status(400).send(err);
  }
});

router.get('/cash-flow-statement', async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query
    const openingBalance = 0;
    let cashFlowFromOperatingActivities = 0;
    let cashFlowFromInvestingActivities = 0;
    let cashFlowFromFinancingActivities = 0;
    let grossCashInflow = 0;
    let grossCashOutflow = 0;

    const cashAffectingTransactions = await Transaction.find({
      user_id: userId,
      affects_cash: true,
      date: {
        $gte: startDate || new Date(new Date().getFullYear(), 0, 1),  // default to year start if no startDate is provided
        $lte: endDate || new Date(),  // default to current date if no endDate is provided
      }
    });

    cashAffectingTransactions.forEach(transaction => {
      const isDebitToCash = transaction.debit_account_name === 'Cash';
      const amount = isDebitToCash ? transaction.amount : -transaction.amount;

      switch (transaction.cash_flow_category) {
        case 'Operating':
          cashFlowFromOperatingActivities += amount;
          break;
        case 'Investing':
          cashFlowFromInvestingActivities += amount;
          break;
        case 'Financing':
          cashFlowFromFinancingActivities += amount;
          break;
      }

      if (isDebitToCash) {
        grossCashInflow += transaction.amount; 
      } else {
        grossCashOutflow += transaction.amount; 
      }
    });

    const closingBalance = openingBalance + cashFlowFromOperatingActivities + cashFlowFromInvestingActivities + cashFlowFromFinancingActivities;

    res.status(200).send({
      openingBalance,
      cashFlowFromOperatingActivities,
      cashFlowFromInvestingActivities,
      cashFlowFromFinancingActivities,
      grossCashInflow,
      grossCashOutflow,
      closingBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.get('/balance-sheet', async (req, res) => {
  try {
    const userId = req.userId;
    
    const revenueAccounts = await ChartOfAccounts.find({ account_type: 'Revenue', user_id: userId });
    const expenseAccounts = await ChartOfAccounts.find({ account_type: 'Expense', user_id: userId });

    const totalRevenue = revenueAccounts.reduce((acc, account) => acc + account.balance, 0);
    const totalExpense = expenseAccounts.reduce((acc, account) => acc + account.balance, 0);
    
    const netIncome = totalRevenue - totalExpense;

    const assets = await ChartOfAccounts.find({ user_id: userId, account_type: 'Asset' });
    const liabilities = await ChartOfAccounts.find({ user_id: userId, account_type: 'Liability' });
    const equity = await ChartOfAccounts.find({ user_id: userId, account_type: 'Equity' });

    const totalCash = assets.filter(a => a.account_name === 'Cash').reduce((acc, a) => acc + a.balance, 0);
    const totalOtherCurrentAsset = assets.filter(a => a.subtype === 'Current Asset' && a.account_name !== 'Cash').reduce((acc, a) => acc + a.balance, 0);
    const totalLongTermAssets = assets.filter(a => a.subtype === 'Non-Current Asset').reduce((acc, a) => acc + a.balance, 0);
    const totalAssets = totalCash + totalOtherCurrentAsset + totalLongTermAssets;

    const totalCurrentLiabilities = liabilities.filter(l => l.subtype === 'Current Liability').reduce((acc, l) => acc + l.balance, 0);
    const totalLongTermLiabilities = liabilities.filter(l => l.subtype === 'Long-Term Liability').reduce((acc, l) => acc + l.balance, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    
    const totalOwnerCapital = equity.filter(e => e.account_name === 'Owner’s Capital').reduce((acc, e) => acc + e.balance, 0);
    const retainedEarningsAccount = equity.find(e => e.account_name === 'Retained Earnings');
    const retainedEarnings = retainedEarningsAccount ? retainedEarningsAccount.balance : 0;

    const totalRetainedEarnings = retainedEarnings + netIncome;

    const totalOtherEquity = equity.filter(e => e.account_name !== 'Retained Earnings' && e.account_name !== 'Owner’s Capital').reduce((acc, e) => acc + e.balance, 0);

    const balanceSheet = {
      totalCash,
      totalOtherCurrentAsset,
      totalLongTermAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      totalOwnerCapital,
      totalOtherEquity,
      totalRetainedEarnings,
      netIncome
    };

    console.log(balanceSheet);

    res.status(200).send(balanceSheet);
  } catch (err) {
    res.status(400).send(err);
  }
});





export default router;

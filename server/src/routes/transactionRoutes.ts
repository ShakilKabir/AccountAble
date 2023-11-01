//routes/transactionRoutes.ts

import express from 'express';
import Transaction from '../models/transaction';
import verifyToken from '../middleware/authMiddleware';
import { ChartOfAccounts } from '../models/chartOfAccounts';

const router = express.Router();

router.use(verifyToken);  // Middleware to authenticate user

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
      
      // Fetch the ObjectIds for account and category
      const debitAccountDocument = await ChartOfAccounts.findOne({ account_name: debit_account_name,user_id:userId });
      const creditAccountDocument = await ChartOfAccounts.findOne({ account_name: credit_account_name, user_id: userId });

      // Validate if we found the account and category
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
      // One of the accounts does not exist, which is an inconsistency, but we still need to handle this.
      return res.status(404).send({ message: 'One or more accounts related to the transaction not found' });
    }
    // Revert the balances
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

    await Transaction.findByIdAndDelete(req.params.transaction_id); // Finally remove the transaction

    res.status(200).send({ message: 'Transaction deleted and account balances updated' });
  } catch (err) {
    res.status(400).send(err);
  }
});

// ... existing code ...


router.get('/income-statement', async (req, res) => {
  console.log('Processing GET request for /', req.userId);
  try {
      const userId = req.userId;
      console.log('userId', userId)

      // Fetch account entries for Revenue and Expense types
      const revenueAccounts = await ChartOfAccounts.find({ account_type: 'Revenue', user_id: userId });
      const expenseAccounts = await ChartOfAccounts.find({ account_type: 'Expense', user_id: userId });

      const revenueAccountIds = revenueAccounts.map(account => account._id);
      const expenseAccountIds = expenseAccounts.map(account => account._id);

      // Fetching all Revenue and Expense transactions for the user
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
    const openingBalance = 0; // You would get this from your balances records.
    let cashFlowFromOperatingActivities = 0;
    let cashFlowFromInvestingActivities = 0;
    let cashFlowFromFinancingActivities = 0;
    let grossCashInflow = 0;
    let grossCashOutflow = 0;

    // Get all transactions that affect cash for the user.
    const cashAffectingTransactions = await Transaction.find({
      user_id: userId,
      affects_cash: true,
    });

    // Iterate through each transaction and update the cash flow and gross inflow/outflow based on category.
    cashAffectingTransactions.forEach(transaction => {
      const isDebitToCash = transaction.debit_account_name === 'Cash';
      const amount = isDebitToCash ? transaction.amount : -transaction.amount;
      console.log('amount', amount)
      console.log('transaction.cash_flow_category', transaction.cash_flow_category)

      // Update cash flow based on category
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
        // No default case needed as we've covered all defined enum values.
      }

      // Update gross inflow and outflow
      if (isDebitToCash) {
        grossCashInflow += transaction.amount; // if cash is credited, it's an inflow
      } else {
        grossCashOutflow += transaction.amount; // if cash is debited, it's an outflow
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
    const assets = await ChartOfAccounts.find({ user_id: userId, account_type: 'Asset' });
    const liabilities = await ChartOfAccounts.find({ user_id: userId, account_type: 'Liability' });
    const equity = await ChartOfAccounts.find({ user_id: userId, account_type: 'Equity' });

    const balanceSheet = {
      assets: assets.map(a => ({ name: a.account_name, balance: a.balance })),
      liabilities: liabilities.map(l => ({ name: l.account_name, balance: l.balance })),
      equity: equity.map(e => ({ name: e.account_name, balance: e.balance }))
    };

    res.status(200).send(balanceSheet);
  } catch (err) {
    res.status(400).send(err);
  }
});



export default router;

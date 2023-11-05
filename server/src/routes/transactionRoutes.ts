// routes/transactionRoutes.ts

import express from 'express';
import { Types } from 'mongoose';
import  Transaction from '../models/transaction'; // Assuming default export of your model
import verifyToken from '../middleware/authMiddleware';
import { ChartOfAccounts } from '../models/chartOfAccounts';
import { Entry, TransactionPostRequestBody } from '../types/index';

const router = express.Router();

router.use(verifyToken);

// GET all transactions for the logged-in user
router.get('/', async (req, res) => {
  try {
    // req.userId should be attached in the authMiddleware and its type is string
    const userId = new Types.ObjectId(req.userId as string); // Convert to ObjectId
    const transactions = await Transaction.find({ user_id: userId });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err });
  }
});

// POST a new transaction
router.post('/', async (req: express.Request<{}, {}, TransactionPostRequestBody>, res) => {
  try {
    const { date, description, debit_entries, credit_entries, cash_flow_category, affects_cash } = req.body;
    const userId = new Types.ObjectId(req.userId as string); // Convert to ObjectId

    const debitAccountDocuments = await Promise.all(debit_entries.map((debitEntry) =>
      ChartOfAccounts.findOne({ account_name: debitEntry.account_name, user_id: userId })
    ));
    const creditAccountDocuments = await Promise.all(credit_entries.map((creditEntry) =>
      ChartOfAccounts.findOne({ account_name: creditEntry.account_name, user_id: userId })
    ));

    if (debitAccountDocuments.some((doc) => !doc) || creditAccountDocuments.some((doc) => !doc)) {
      return res.status(400).json({ message: 'One or more accounts not found' });
    }

    const newDebitEntries = debit_entries.map((entry, index) => ({
      ...entry,
      account_type: debitAccountDocuments[index]?._id as Types.ObjectId
    }));
    const newCreditEntries = credit_entries.map((entry, index) => ({
      ...entry,
      account_type: creditAccountDocuments[index]?._id as Types.ObjectId
    }));

    const transactionData = {
      date,
      description,
      debit_entries: newDebitEntries,
      credit_entries: newCreditEntries,
      user_id: userId,
      cash_flow_category,
      affects_cash
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).json(transaction); // Use 201 for created resources
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: 'Error creating transaction', error: err });
  }
});




// router.put('/:transaction_id', async (req, res) => {
//   try {
//     const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.transaction_id, req.body, { new: true });
//     res.status(200).send(updatedTransaction);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

// router.delete('/:transaction_id', async (req, res) => {
//   try {
//     const transaction = await Transaction.findById(req.params.transaction_id);
//     if (!transaction) {
//       return res.status(404).send({ message: 'Transaction not found' });
//     }
    
//     const debitAccount = await ChartOfAccounts.findById(transaction.debit_account_type);
//     const creditAccount = await ChartOfAccounts.findById(transaction.credit_account_type);

//     if (debitAccount === null || creditAccount === null) {
//       return res.status(404).send({ message: 'One or more accounts related to the transaction not found' });
//     }
//     if (debitAccount.account_type === 'Asset' || debitAccount.account_type === 'Expense') {
//       debitAccount.balance -= transaction.amount;
//     } else {
//       debitAccount.balance += transaction.amount;
//     }

//     if (creditAccount.account_type === 'Liability' || creditAccount.account_type === 'Equity' || creditAccount.account_type === 'Revenue') {
//       creditAccount.balance -= transaction.amount;
//     } else {
//       creditAccount.balance += transaction.amount;
//     }

//     await debitAccount.save();
//     await creditAccount.save();

//     await Transaction.findByIdAndDelete(req.params.transaction_id); 

//     res.status(200).send({ message: 'Transaction deleted and account balances updated' });
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

router.get('/income-statement', async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.userId as string); // Ensure the userId is an ObjectId

    // Fetch all revenue and expense accounts for the user
    const revenueAccounts = await ChartOfAccounts.find({ account_type: 'Revenue', user_id: userId });
    const expenseAccounts = await ChartOfAccounts.find({ account_type: 'Expense', user_id: userId });

    // Map the account IDs for query
    const revenueAccountIds = revenueAccounts.map(account => account._id);
    const expenseAccountIds = expenseAccounts.map(account => account._id);

    // Fetch transactions that have any credit entries with account types matching revenue account IDs
    const revenueTransactions = await Transaction.aggregate([
      { $match: { user_id: userId } },
      { $unwind: "$credit_entries" },
      { $match: { "credit_entries.account_type": { $in: revenueAccountIds } } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: "$credit_entries.amount" },
        transactions: { $push: "$$ROOT" }
      }}
    ]);

    // Fetch transactions that have any debit entries with account types matching expense account IDs
    const expenseTransactions = await Transaction.aggregate([
      { $match: { user_id: userId } },
      { $unwind: "$debit_entries" },
      { $match: { "debit_entries.account_type": { $in: expenseAccountIds } } },
      { $group: {
        _id: null,
        totalExpenses: { $sum: "$debit_entries.amount" },
        transactions: { $push: "$$ROOT" }
      }}
    ]);

    // Extract transactions from the aggregation result
    const revenueResults = revenueTransactions.length ? revenueTransactions[0].transactions : [];
    const expenseResults = expenseTransactions.length ? expenseTransactions[0].transactions : [];

    // Note: Depending on the frontend expectation you may need to adjust the structure of the response
    res.status(200).send([revenueResults, expenseResults]);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error fetching income statement', error: err });
  }
});

// router.get('/cash-flow-statement', async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { startDate, endDate } = req.query
//     const openingBalance = 0;
//     let cashFlowFromOperatingActivities = 0;
//     let cashFlowFromInvestingActivities = 0;
//     let cashFlowFromFinancingActivities = 0;
//     let grossCashInflow = 0;
//     let grossCashOutflow = 0;

//     const cashAffectingTransactions = await Transaction.find({
//       user_id: userId,
//       affects_cash: true,
//       date: {
//         $gte: startDate || new Date(new Date().getFullYear(), 0, 1),  // default to year start if no startDate is provided
//         $lte: endDate || new Date(),  // default to current date if no endDate is provided
//       }
//     });

//     cashAffectingTransactions.forEach(transaction => {
//       const isDebitToCash = transaction.debit_account_name === 'Cash';
//       const amount = isDebitToCash ? transaction.amount : -transaction.amount;

//       switch (transaction.cash_flow_category) {
//         case 'Operating':
//           cashFlowFromOperatingActivities += amount;
//           break;
//         case 'Investing':
//           cashFlowFromInvestingActivities += amount;
//           break;
//         case 'Financing':
//           cashFlowFromFinancingActivities += amount;
//           break;
//       }

//       if (isDebitToCash) {
//         grossCashInflow += transaction.amount; 
//       } else {
//         grossCashOutflow += transaction.amount; 
//       }
//     });

//     const closingBalance = openingBalance + cashFlowFromOperatingActivities + cashFlowFromInvestingActivities + cashFlowFromFinancingActivities;

//     res.status(200).send({
//       openingBalance,
//       cashFlowFromOperatingActivities,
//       cashFlowFromInvestingActivities,
//       cashFlowFromFinancingActivities,
//       grossCashInflow,
//       grossCashOutflow,
//       closingBalance,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(400).send(err);
//   }
// });

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

    res.status(200).send(balanceSheet);
  } catch (err) {
    res.status(400).send(err);
  }
});

// router.get('/balance-sheet-by-date', async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { date } = req.query; // The date query parameter is expected to be provided

//     if (!date || typeof date !== 'string') {
//       return res.status(400).send({ message: 'Please provide a date query parameter.' });
//     }

//     // Convert query parameter to a date object
//     const endDate = new Date(date);

//     // Get all transactions up to the end date
//     const transactions = await Transaction.find({
//       user_id: userId,
//       date: { $lte: endDate },
//     })

//     // Function to calculate the account balance by iterating over transactions
//     const calculateAccountBalance = (accountId :Types.ObjectId, accountType:string) => {
//       return transactions.reduce((acc, transaction) => {
//         const affectsDebit = transaction.debit_account_type.equals(accountId);
//         const affectsCredit = transaction.credit_account_type.equals(accountId);
    
//         // If the account is of type 'Asset' or 'Expense', then debits increase the balance and credits decrease it.
//         if (accountType === 'Asset' || accountType === 'Expense') {
//           if (affectsDebit) {
//             return acc + transaction.amount; // Debit increases asset & expense
//           } else if (affectsCredit) {
//             return acc - transaction.amount; // Credit decreases asset & expense
//           }
//         }
//         // If the account is of type 'Liability', 'Equity', or 'Revenue', then credits increase the balance and debits decrease it.
//         else if (accountType === 'Liability' || accountType === 'Equity' || accountType === 'Revenue') {
//           if (affectsCredit) {
//             return acc + transaction.amount; // Credit increases liability, equity & revenue
//           } else if (affectsDebit) {
//             return acc - transaction.amount; // Debit decreases liability, equity & revenue
//           }
//         }
    
//         return acc;
//       }, 0);
//     };
    

//     // Fetch the current chart of accounts
//     const chartOfAccounts = await ChartOfAccounts.find({ user_id: userId });

//     // Calculate historical balances for each account
//     const historicalBalances = chartOfAccounts.map(account => ({
//       ...account.toJSON(),
//       historical_balance: calculateAccountBalance(account._id, account.account_type)
//     }));
//     console.log(historicalBalances);

//     // Use the historicalBalances to calculate the fields for the balance sheet
//     // ... repeat logic from '/balance-sheet' here but with historical_balances ...

//     // Example of calculations with historical_balances
//     const totalRevenue = historicalBalances.filter(a => a.account_type === 'Revenue').reduce((acc, a) => acc + a.historical_balance, 0);
//     const totalExpense = historicalBalances.filter(a => a.account_type === 'Expense').reduce((acc, a) => acc + a.historical_balance, 0);
//     const netIncome = totalRevenue - totalExpense;

//     const totalCash = historicalBalances.filter(a => a.account_name === 'Cash').reduce((acc, a) => acc + a.historical_balance, 0);
//     const totalOtherCurrentAsset = historicalBalances.filter(a => a.subtype === 'Current Asset' && a.account_name !== 'Cash').reduce((acc, a) => acc + a.historical_balance, 0);
//     const totalLongTermAssets = historicalBalances.filter(a => a.subtype === 'Non-Current Asset').reduce((acc, a) => acc + a.historical_balance, 0);
//     const totalAssets = totalCash + totalOtherCurrentAsset + totalLongTermAssets;

//     const totalCurrentLiabilities = historicalBalances.filter(l => l.subtype === 'Current Liability').reduce((acc, l) => acc + l.historical_balance, 0);
//     const totalLongTermLiabilities = historicalBalances.filter(l => l.subtype === 'Long-Term Liability').reduce((acc, l) => acc + l.historical_balance, 0);
//     const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    
//     const totalOwnerCapital = historicalBalances.filter(e => e.account_name === 'Owner’s Capital').reduce((acc, e) => acc + e.historical_balance, 0);
//     const retainedEarningsAccount = historicalBalances.find(e => e.account_name === 'Retained Earnings');
//     const retainedEarnings = retainedEarningsAccount ? retainedEarningsAccount.historical_balance : 0;
//     const totalRetainedEarnings = retainedEarnings + netIncome;

//     const totalOtherEquity = historicalBalances.filter(e => e.account_type==='Equity' && e.account_name !== 'Retained Earnings' && e.account_name !== 'Owner’s Capital').reduce((acc, e) => acc + e.historical_balance, 0);

//     const balanceSheet = {
//       totalCash,
//       totalOtherCurrentAsset,
//       totalLongTermAssets,
//       totalAssets,
//       totalCurrentLiabilities,
//       totalLongTermLiabilities,
//       totalLiabilities,
//       totalOwnerCapital,
//       totalOtherEquity,
//       totalRetainedEarnings,
//       netIncome
//     };

//     res.status(200).send(balanceSheet);

//   } catch (err) {
//     res.status(400).send(err);
//   }
// });






export default router;

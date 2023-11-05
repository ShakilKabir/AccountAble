//models/transaction.ts

import mongoose, { CallbackError } from 'mongoose';
import { ChartOfAccounts } from './chartOfAccounts';

const entrySchema = new mongoose.Schema({
  account_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccounts',
    required: true
  },
  account_name: { type: String, required: true },
  amount: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  debit_entries: [entrySchema],
  credit_entries: [entrySchema],
  description: { type: String },
  affects_cash: { type: Boolean, default: false },
  cash_flow_category: {
    type: String,
    enum: ['Operating', 'Investing', 'Financing', 'None'],
    required: true
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


transactionSchema.pre('save', async function (next) {
  try {
    // Aggregate debit and credit amounts separately
    const totalDebits = this.debit_entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = this.credit_entries.reduce((sum, entry) => sum + entry.amount, 0);

    // Check if total debits equals total credits
    if (totalDebits !== totalCredits) {
      throw new Error('The sum of debits does not equal the sum of credits.');
    }

    // Process each debit entry
    for (let entry of this.debit_entries) {
      const account = await ChartOfAccounts.findById(entry.account_type);
      if (!account) {
        throw new Error(`Debit account not found for ID: ${entry.account_type}`);
      }
      if (account.account_type === 'Asset' || account.account_type === 'Expense') {
        account.balance += entry.amount; 
      } else {
        account.balance -= entry.amount;
      }
      await account.save();
    }

    // Process each credit entry
    for (let entry of this.credit_entries) {
      const account = await ChartOfAccounts.findById(entry.account_type);
      if (!account) {
        throw new Error(`Credit account not found for ID: ${entry.account_type}`);
      }
      if (account.account_type === 'Liability' || account.account_type === 'Equity' || account.account_type === 'Revenue') {
        account.balance += entry.amount; 
      } else {
        account.balance -= entry.amount; 
      }
      await account.save();
    }

    next();
  } catch (error) {
    next(error as CallbackError);
  }
});



export default mongoose.model('Transaction', transactionSchema);

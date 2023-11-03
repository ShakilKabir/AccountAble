//models/transaction.ts

import mongoose from 'mongoose';
import { ChartOfAccounts } from './chartOfAccounts';

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  debit_account_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccounts', required: true },
  debit_account_name: { type: String, required: true },
  amount: { type: Number, required: true },
  credit_account_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccounts', required: true },
  credit_account_name: { type: String, required: true },
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
  const debitAccount = await ChartOfAccounts.findById(this.debit_account_type);
  const creditAccount = await ChartOfAccounts.findById(this.credit_account_type);

  if (!debitAccount || !creditAccount) {
    throw new Error('Account not found');
  }

  if (debitAccount.account_type === 'Asset' || debitAccount.account_type === 'Expense') {
    debitAccount.balance += this.amount; 
  } else {
    debitAccount.balance -= this.amount;
  }

  if (creditAccount.account_type === 'Liability' || creditAccount.account_type === 'Equity' || creditAccount.account_type === 'Revenue') {
    creditAccount.balance += this.amount; 
  } else {
    creditAccount.balance -= this.amount; 
  }

  await debitAccount.save();
  await creditAccount.save();

  next();
});

export default mongoose.model('Transaction', transactionSchema);

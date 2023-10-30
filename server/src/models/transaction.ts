//models/transaction.ts

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  category_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccounts', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  account_type: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccounts', required: true },
  account: { type: String, required: true },
  description: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model('Transaction', transactionSchema);

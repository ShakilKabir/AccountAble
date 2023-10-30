//models/chartOfAccounts.ts

import mongoose from 'mongoose';

const chartOfAccountsSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  account_name: { type: String, required: true },
  account_type: {
    type: String,
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    required: true
  },
  subtype: { type: String },
  description: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export const ChartOfAccounts = mongoose.model('ChartOfAccounts', chartOfAccountsSchema);

export const initializeDefaultAccounts = async (userId: string) => {
  const predefinedAccounts = [
    {
      user_id: userId,
      account_name: 'Cash',
      account_type: 'Asset',
      subtype: 'Current Asset',
      description: 'Cash on hand and in bank',
    },
    {
      user_id: userId,
      account_name: 'Accounts Receivable',
      account_type: 'Asset',
      subtype: 'Current Asset',
      description: 'Amounts owed by customers from sales on credit',
    },
    {
      user_id: userId,
      account_name: 'Inventory',
      account_type: 'Asset',
      subtype: 'Current Asset',
      description: 'Goods available for sale to customers',
    },
    {
      user_id: userId,
      account_name: 'Prepaid Expenses',
      account_type: 'Asset',
      subtype: 'Current Asset',
      description: 'Expenses paid in advance such as insurance',
    },
    {
      user_id: userId,
      account_name: 'Equipment',
      account_type: 'Asset',
      subtype: 'Non-Current Asset',
      description: 'Long-term assets such as machinery and equipment',
    },
    {
      user_id: userId,
      account_name: 'Building',
      account_type: 'Asset',
      subtype: 'Non-Current Asset',
      description: 'Real estate owned by the company',
    },
    {
      user_id: userId,
      account_name: 'Land',
      account_type: 'Asset',
      subtype: 'Non-Current Asset',
      description: 'Cost of land owned by the company',
    },
    {
      user_id: userId,
      account_name: 'Accounts Payable',
      account_type: 'Liability',
      subtype: 'Current Liability',
      description: 'Amounts owed to suppliers or other creditors',
    },
    {
      user_id: userId,
      account_name: 'Accrued Expenses',
      account_type: 'Liability',
      subtype: 'Current Liability',
      description: 'Expenses that have been incurred but not yet paid',
    },
    {
      user_id: userId,
      account_name: 'Unearned Revenue',
      account_type: 'Liability',
      subtype: 'Current Liability',
      description: 'Payments received from customers for services yet to be delivered',
    },
    {
      user_id: userId,
      account_name: 'Notes Payable',
      account_type: 'Liability',
      subtype: 'Long-Term Liability',
      description: 'Amounts owed that are due more than one year in the future',
    },
    {
      user_id: userId,
      account_name: 'Mortgage Payable',
      account_type: 'Liability',
      subtype: 'Long-Term Liability',
      description: 'Long-term loans taken out on property',
    },
    {
      user_id: userId,
      account_name: 'Sales Revenue',
      account_type: 'Revenue',
      description: 'Income from goods sold or services rendered',
    },
    {
      user_id: userId,
      account_name: 'Service Revenue',
      account_type: 'Revenue',
      description: 'Income from services provided to customers',
    },
    {
      user_id: userId,
      account_name: 'Interest Revenue',
      account_type: 'Revenue',
      description: 'Income earned from investments and interest-bearing accounts',
    },
    {
      user_id: userId,
      account_name: 'Rent Expense',
      account_type: 'Expense',
      description: 'Periodic payments for rental of property or equipment',
    },
    {
      user_id: userId,
      account_name: 'Utilities Expense',
      account_type: 'Expense',
      description: 'Costs of utilities such as electricity, water, and internet',
    },
    {
      user_id: userId,
      account_name: 'Salaries Expense',
      account_type: 'Expense',
      description: 'Wages paid to employees',
    },
    {
      user_id: userId,
      account_name: 'Depreciation Expense',
      account_type: 'Expense',
      description: 'Allocation of the cost of tangible assets over their useful lives',
    },
    {
      user_id: userId,
      account_name: 'Owner’s Capital',
      account_type: 'Equity',
      description: 'Investment of cash or other assets by the owner into the business',
    },
    {
      user_id: userId,
      account_name: 'Retained Earnings',
      account_type: 'Equity',
      description: 'Earnings not distributed to shareholders and reinvested in the business',
    },
    // ... You can add or modify accounts as needed to fit the business context
  ];

  return ChartOfAccounts.insertMany(predefinedAccounts);
};

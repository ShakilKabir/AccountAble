//types/index.ts

import { Types } from 'mongoose';

export class Entry {
  account_type: Types.ObjectId = new Types.ObjectId();
  account_name: string = '';
  amount: number = 0;
}

export class Transaction {
  date: Date = new Date();
  description: string = '';
  debit_entries: Entry[] = [];
  credit_entries: Entry[] = [];
  affects_cash: boolean = false;
  cash_flow_category: 'Operating' | 'Investing' | 'Financing' | 'None' = 'None';
  user_id: Types.ObjectId = new Types.ObjectId();
}

export class TransactionPostRequestBody {
  date: Date = new Date();
  description: string = '';
  debit_entries: Omit<Entry, 'account_type'>[] = [];
  credit_entries: Omit<Entry, 'account_type'>[] = [];
  affects_cash: boolean = false;
  cash_flow_category: Transaction['cash_flow_category'] = 'None';
  user_id: string = '';
}

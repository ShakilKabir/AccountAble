// scheduler.ts

import cron from 'node-cron';
import Transaction from './models/transaction'; 
import { ChartOfAccounts } from './models/chartOfAccounts';

async function cloneAndSaveTransaction(transaction : any) {
  const now = new Date();
  const formattedTimestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  const accountsPayable = await ChartOfAccounts.findOne({ account_name: 'Accounts Payable', user_id:transaction.user_id});

  const newTransactionData = {
    ...transaction.toObject(),
    _id: undefined,
    __v: undefined,
    date: new Date().toISOString(),
    description: `${transaction.description} - Created at ${formattedTimestamp}`,
    affects_cash: false,
  };
  newTransactionData.credit_entries = newTransactionData.credit_entries.map((entry:any) => ({
    ...entry,
    account_type: accountsPayable?._id,
    account_name: 'Accounts Payable',
    _id: undefined 
  }));

  delete newTransactionData.recurrence;

  const newTransaction = new Transaction(newTransactionData);
  await newTransaction.save();
}

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    const transactionsToRecur = await Transaction.find({ recurrence: true });
    for (const transaction of transactionsToRecur) {
      await cloneAndSaveTransaction(transaction);
    }
  });
};

export default startCronJobs;

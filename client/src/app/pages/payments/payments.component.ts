import { Component, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styles: []
})
export class PaymentsComponent implements OnInit {
  payables: any[] = [];
  receivables: any[] = [];

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe(
      (data) => {
        this.extractPayablesAndReceivables(data);
        console.log(data)
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );
  }

  extractPayablesAndReceivables(transactions: any[]): void {
    this.payables = transactions.filter(t =>
      t.isPaidOrReceived === false &&
      t.credit_entries.some((e: any) => e.account_name === 'Accounts Payable')
    ).map(payable => ({
      ...payable,
      amount: payable.credit_entries.find((e: any) => e.account_name === 'Accounts Payable').amount
    }));
  
    this.receivables = transactions.filter(t =>
      t.isPaidOrReceived === false &&
      t.debit_entries.some((e: any) => e.account_name === 'Accounts Receivable')
    ).map(receivable => ({
      ...receivable,
      amount: receivable.debit_entries.find((e: any) => e.account_name === 'Accounts Receivable').amount
    }));
  }
  
  

  payPayable(payable: any) {
    this.transactionService.updateTransactionStatus(payable._id, true).subscribe(
      (response) => {
        console.log('Payment successful:', response);
        this.createTransactionForPayable(payable);
        this.loadTransactions();
      },
      (error) => {
        console.error('Error updating payment status:', error);
      }
    );
  }
  
  collectReceivable(receivable: any) {
    this.transactionService.updateTransactionStatus(receivable._id, true).subscribe(
      (response) => {
        console.log('Collection successful:', response);
        this.createTransactionForReceivable(receivable);
        this.loadTransactions();
      },
      (error) => {
        console.error('Error updating collection status:', error);
      }
    );
  }

  createTransactionForPayable(payable: any) {
    const transaction = {
      date: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      description: 'Paid - ' + payable.description,
      debit_entries: [
        { account_name: 'Accounts Payable', amount: payable.amount }
      ],
      credit_entries: [
        { account_name: 'Cash', amount: payable.amount }
      ],
      cash_flow_category: 'Operating',
      affects_cash: true,
    };
    this.addTransaction(transaction);
  }

  createTransactionForReceivable(receivable: any) {
    const transaction = {
      date: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      description: 'Received - ' + receivable.description,
      debit_entries: [
        { account_name: 'Cash', amount: receivable.amount }
      ],
      credit_entries: [
        { account_name: 'Accounts Receivable', amount: receivable.amount }
      ],
      cash_flow_category: 'Operating',
      affects_cash: true,
    };
    this.addTransaction(transaction);
  }

  private addTransaction(transaction: any) {
    this.transactionService.addTransaction(transaction).subscribe(
      (response) => {
        console.log('Transaction added:', response);
      },
      (error) => {
        console.error('Error adding transaction:', error);
      }
    );
  }
  
}

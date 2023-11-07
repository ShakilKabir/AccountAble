//transactions.component.ts

import { TransactionService } from 'src/app/services/transaction.service';
import { TransactionFormComponent } from './../../components/transaction-form/transaction-form.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];

  public showIncomeModal = false;
  public showExpenseModal = false;
  public showJournalModal = false;
  public showDetailModal = false;
  public currentTransactionDetails: any = null;

  get isAnyModalOpen(): boolean {
    return (
      this.showIncomeModal || this.showExpenseModal || this.showDetailModal
    );
  }

  toggleIncomeModal() {
    this.showIncomeModal = !this.showIncomeModal;
  }

  toggleExpenseModal() {
    this.showExpenseModal = !this.showExpenseModal;
  }

  toggleJournalModal() {
    this.showJournalModal = !this.showJournalModal;
  }

  openDetailModal(transaction: any): void {
    this.currentTransactionDetails = transaction;
    this.showDetailModal = true;
  }

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe(
      (data) => {
        this.transactions = data;
        console.log(data);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );
  }
  deleteTransaction(id: string): void {
    this.transactionService.deleteTransaction(id).subscribe(
      () => {
        this.loadTransactions();
      },
      (error) => {
        console.error('Error deleting transaction:', error);
      }
    );
  }
}

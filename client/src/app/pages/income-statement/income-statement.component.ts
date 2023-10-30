//pages/income-statement.component.ts

import { TransactionService } from 'src/app/services/transaction.service';
import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
})

export class IncomeStatementComponent implements OnInit {
  transactions: any[] = [];
  totalRevenue: number = 0;
  totalExpense: number = 0;
  netIncome: number = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getIncomeStatement().subscribe({
      next: (data: any[]) => {
        this.transactions = data;
        console.log(this.transactions, data)
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  calculateTotals() {
    this.totalRevenue = this.transactions[0].reduce((acc: number, transaction: Transaction) => acc + (transaction.amount || 0), 0);
    this.totalExpense = this.transactions[1].reduce((acc: number, transaction: Transaction) => acc + (transaction.amount || 0), 0);
    this.netIncome = this.totalRevenue - this.totalExpense;
    console.log(this.totalRevenue, this.totalExpense, this.netIncome)
  }
  
}

//pages/income-statement.component.ts

import { TransactionService } from 'src/app/services/transaction.service';
import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
})

export class IncomeStatementComponent implements OnInit {
  transactions: any[] = [];
  totalRevenue: number = 0;
  totalExpense: number = 0;
  netIncome: number = 0;
  startDate: string = '';
  endDate: string = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    const currentDate = new Date();
    this.endDate = currentDate.toISOString().split('T')[0];
    this.startDate = new Date(
      new Date().getFullYear(),
      0,
      1
    ).toLocaleDateString('sv-SE', { timeZone: 'Asia/Dhaka' });
    this.loadTransactions();
  }

  updateReport() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getIncomeStatement().subscribe({
      next: (data: any[]) => {
        console.log(data);
        // Assuming the backend sends the data in the same structure you printed
        const revenues = data[0]; // Revenue Transactions
        const expenses = data[1]; // Expense Transactions
        
        // Filter and process transactions based on the date
        this.transactions = [
          this.processTransactions(revenues, this.startDate, this.endDate, 'revenue'),
          this.processTransactions(expenses, this.startDate, this.endDate, 'expense')
        ];

        // Calculate totals
        this.calculateTotals();
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  processTransactions(transactions: any[], startDate: string, endDate: string, type: 'revenue' | 'expense') {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    }).flatMap(transaction => 
      // Choose only credit entries for revenue, and debit for expenses
      type === 'revenue' ? [transaction.credit_entries] : transaction.debit_entries
    );
  }
  
  

  calculateTotals() {
    this.totalRevenue = this.transactions[0].reduce((acc: number, entry: any) => acc + entry.amount, 0);
    this.totalExpense = this.transactions[1].reduce((acc: number, entry: any) => acc + entry.amount, 0);
    this.netIncome = this.totalRevenue - this.totalExpense;
  }

  exportAsPDF(divId: string) {
    const data = document.getElementById(divId);
    html2canvas(data!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('income-statement.pdf');
    });
  }
}

//pages/journal-entry.component.ts

import { Component, OnInit } from '@angular/core';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';

@Component({
  selector: 'app-journal-entry',
  templateUrl: './journal-entry.component.html',
  styleUrls: ['./journal-entry.component.css'],
})
export class JournalEntryComponent implements OnInit {
  accounts: any[] = [];
  journalEntry: any = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    cash_flow_category: 'None',
    lines: [
      { account: '', debit: 0, credit: 0 },
      { account: '', debit: 0, credit: 0 },
    ],
  };
  totalDebits: number = 0;
  totalCredits: number = 0;

  constructor(private chartOfAccountsService: ChartOfAccountsService) {}

  ngOnInit(): void {
    this.chartOfAccountsService.getAccounts().subscribe(
      (data) => {
        this.accounts = data;
        console.log(data);
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

  addLine(): void {
    this.journalEntry.lines.push({ account: '', debit: 0, credit: 0 });
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalDebits = this.journalEntry.lines.reduce(
      (sum: number, line: any) => sum + line.debit,
      0
    );
    this.totalCredits = this.journalEntry.lines.reduce(
      (sum: number, line: any) => sum + line.credit,
      0
    );
  }

  onValueChange(line: any): void {
    if (line.debit !== 0 && line.credit !== 0) {
      if (line.debit > 0) {
        line.credit = 0;
      } else if (line.credit > 0) {
        line.debit = 0;
      }
    }
    this.calculateTotals();
  }
  
}

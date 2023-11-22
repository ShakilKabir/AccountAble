import { TransactionService } from './../../services/transaction.service';
//pages/journal-entry.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
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
  journalForm: FormGroup;

  constructor(
    private chartOfAccountsService: ChartOfAccountsService,
    private fb: FormBuilder,
    private transactionService: TransactionService
  ) {
    this.journalForm = this.fb.group({
      date: new Date().toISOString().split('T')[0],
      description: '',
      cash_flow_category: 'None',
      lines: this.fb.array([]),
    });
  }

  get lines(): FormArray {
    return this.journalForm.get('lines') as FormArray;
  }

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

    this.addLine();
    this.addLine();

    this.lines.valueChanges.subscribe((lines) => {
      this.totalDebits = 0;
      this.totalCredits = 0;
      lines.forEach((line: any) => {
        // Ensure we're working with numbers
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;

        if (debit > 0 && credit !== 0) {
          line.credit = 0;
          this.lines
            .at(lines.indexOf(line))
            .get('credit')!
            .setValue(0, { emitEvent: false });
        }
        if (credit > 0 && debit !== 0) {
          line.debit = 0;
          this.lines
            .at(lines.indexOf(line))
            .get('debit')!
            .setValue(0, { emitEvent: false });
        }

        this.totalDebits += debit;
        this.totalCredits += credit;
      });
    });
  }

  addLine(): void {
    const lineFormGroup = this.fb.group({
      account: '',
      debit: 0,
      credit: 0,
    });
    this.lines.push(lineFormGroup);
  }
  removeLine(index: number): void {
    this.lines.removeAt(index);
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

  onSaveEntry(): void {
    const formModel = this.journalForm.value;

    const transaction = {
      date: formModel.date,
      description: formModel.description,
      cash_flow_category: formModel.cash_flow_category,
      debit_entries: formModel.lines
        .filter((line: any) => line.debit > 0)
        .map((line: any) => ({
          account_name: line.account,
          amount: line.debit,
        })),
      credit_entries: formModel.lines
        .filter((line: any) => line.credit > 0)
        .map((line: any) => ({
          account_name: line.account,
          amount: line.credit,
        })),
      affects_cash: formModel.cash_flow_category !== 'None',
    };
    this.transactionService.addTransaction(transaction).subscribe({
      next: (response) => {
        console.log('Transaction saved:', response);
      },
      error: (error) => {
        console.error('Error saving transaction:', error);
      },
    });
    console.log(this.journalEntry);
  }
}

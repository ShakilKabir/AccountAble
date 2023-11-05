// transaction-form.component.ts

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { TransactionService } from 'src/app/services/transaction.service';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';
import { Entry } from 'src/app/models/entry';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html'
})
export class TransactionFormComponent implements OnInit {

  @Input() type: 'deposit' | 'withdrawal' | 'journal' = 'deposit'; 
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() transactionAdded = new EventEmitter<void>();

  transactionForm: FormGroup;
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  filteredCategories: any[] = [];

  constructor(private fb: FormBuilder,private transactionService: TransactionService, private chartOfAccountsService: ChartOfAccountsService) {
    this.transactionForm = this.fb.group({
      date: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
      description: new FormControl('', Validators.required),
      account: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      amount: new FormControl(0, Validators.required),
      cash_flow_category: this.type === 'journal' ? new FormControl('') : null
    });
   }

   isString(value: any): boolean {
    return typeof value === 'string';
  }
   
   ngOnInit(): void {
    this.chartOfAccountsService.getAccounts().subscribe(
      data => {
        this.accounts = data;
        this.filterAccountsAndCategories();
      },
      error => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

  filterAccountsAndCategories(): void {
    if (this.type === 'deposit') {
      this.filteredAccounts = ['Cash', 'Accounts Receivable'];
      this.filteredCategories = this.accounts.filter(acc => acc.account_type === 'Revenue');
      console.log(this.filteredCategories, this.accounts)
    } else if (this.type === 'withdrawal') {
      this.filteredAccounts = ['Cash', 'Accounts Payable'];
      this.filteredCategories = this.accounts.filter(acc => acc.account_type === 'Expense');
      console.log(this.filteredCategories, this.accounts)
    } else if (this.type === 'journal') {
      console.log(this.accounts)
      this.filteredAccounts = this.accounts.filter(acc => acc.account_type);
      this.filteredCategories = this.accounts.filter(acc => acc.account_type);
    }
  }
  
  onSave(): void {
    if (this.transactionForm.valid) {
      const transactionPayload: any = {
        date: this.transactionForm.value.date,
        description: this.transactionForm.value.description,
        cash_flow_category: this.transactionForm.value.cash_flow_category || 'Operating',
        affects_cash: false,
        debit_entries: [],
        credit_entries: []
      };
  
      // Assuming the form control 'amount' contains the transaction amount
      const amount = this.transactionForm.value.amount;
  
      if (this.type === 'deposit') {
        transactionPayload.debit_entries.push({
          account_name: this.transactionForm.value.account,
          amount: amount
        });
        transactionPayload.credit_entries.push({
          account_name: this.transactionForm.value.category,
          amount: amount
        });
      } else if (this.type === 'withdrawal') {
        transactionPayload.debit_entries.push({
          account_name: this.transactionForm.value.category,
          amount: amount
        });
        transactionPayload.credit_entries.push({
          account_name: this.transactionForm.value.account,
          amount: amount
        });
      } else if (this.type === 'journal') {
        transactionPayload.debit_entries.push({
          account_name: this.transactionForm.value.account,
          amount: amount
        });
        transactionPayload.credit_entries.push({
          account_name: this.transactionForm.value.category,
          amount: amount
        });
      }
  
      // Set affects_cash based on account names
      transactionPayload.affects_cash = transactionPayload.debit_entries.some((entry:Entry) => entry.account_name === 'Cash') || transactionPayload.credit_entries.some((entry:Entry) => entry.account_name === 'Cash');
  
      console.log(transactionPayload);
  
      this.transactionService.addTransaction(transactionPayload).subscribe(
        () => {
          console.log('Transaction added successfully');
          this.transactionAdded.emit(); 
          this.onClose();
        },
        error => {
          console.error('Error adding transaction:', error);
        }
      );
    } else {
      console.error('Form is not valid');
    }
  }
  

  onClose(): void {
    this.close.emit();
  }

}

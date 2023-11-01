// transaction-form.component.ts

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { TransactionService } from 'src/app/services/transaction.service';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';

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
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
  
      if (control && control.errors) {
          Object.keys(control.errors).forEach(keyError => {
              console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', control.errors![keyError]);
          });
      }
    });
    console.log(this.transactionForm.errors);
    console.log(this.transactionForm);
    if (this.transactionForm.valid) {
      if (this.type === 'deposit') {
        this.transactionForm.value.debit_account_name = this.transactionForm.value.account;
        this.transactionForm.value.credit_account_name = this.transactionForm.value.category;
        if(this.transactionForm.value.account === 'Cash'){
          this.transactionForm.value.cash_flow_category = 'Operating';
          this.transactionForm.value.affects_cash = true;
        } else {
          this.transactionForm.value.cash_flow_category = 'None';
          this.transactionForm.value.affects_cash = false;
        }
      } else if (this.type === 'withdrawal') {
        this.transactionForm.value.debit_account_name = this.transactionForm.value.category;
        this.transactionForm.value.credit_account_name = this.transactionForm.value.account;
        if(this.transactionForm.value.account === 'Cash'){
          this.transactionForm.value.cash_flow_category = 'Operating';
          this.transactionForm.value.affects_cash = true;
        } else {
          this.transactionForm.value.cash_flow_category = 'None';
          this.transactionForm.value.affects_cash = false;
        }
      } else if (this.type === 'journal') {
        this.transactionForm.value.debit_account_name = this.transactionForm.value.account;
        this.transactionForm.value.credit_account_name = this.transactionForm.value.category;
        if(this.transactionForm.value.account === 'Cash' || this.transactionForm.value.category === 'Cash'){
          this.transactionForm.value.affects_cash = true;
        } else {
          this.transactionForm.value.cash_flow_category = 'None';
          this.transactionForm.value.affects_cash = false;
        }
      }
      console.log(this.transactionForm.value,this.type);
      
      this.transactionService.addTransaction(this.transactionForm.value).subscribe(
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

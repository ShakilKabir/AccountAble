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

  @Input() type: 'deposit' | 'withdrawal'= 'deposit'; // input to determine if it's a deposit or withdrawal
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>(); // emit an event to close the modal
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
      amount: new FormControl(0, Validators.required)
    });
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
    } else if (this.type === 'withdrawal') {
      this.filteredAccounts = ['Cash', 'Accounts Payable'];
      this.filteredCategories = this.accounts.filter(acc => acc.account_type === 'Expense');
    }
  }
  
  onSave(): void {
    if (this.transactionForm.valid) {
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

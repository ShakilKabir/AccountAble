//pages/chart-of-accounts.component.ts

import { Component, OnInit } from '@angular/core';
import { ChartOfAccountsService } from '../../services/chart-of-accounts.service';

@Component({
  selector: 'app-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styles: [],
})
export class ChartOfAccountsComponent implements OnInit {
  accounts: any[] = [];

  constructor(private chartOfAccountsService: ChartOfAccountsService) {}

  ngOnInit(): void {
    this.chartOfAccountsService.getAccounts().subscribe(
      (data) => {
        this.accounts = data;
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

  onAddAccount(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const accountName = (form.querySelector('#accountName') as HTMLInputElement)
      .value;
    const accountType = (
      form.querySelector('#accountType') as HTMLSelectElement
    ).value;
    const accountSubtype = (
      form.querySelector('#accountSubtype') as HTMLSelectElement
    ).value;

    const accountData = {
      account_name: accountName,
      account_type: accountType,
      subtype: accountSubtype,
    };

    this.chartOfAccountsService.addAccount(accountData).subscribe(
      (data) => {
        this.accounts.push(data);
        form.reset();
      },
      (error) => {
        console.error('Error adding account:', error);
      }
    );
  }
}

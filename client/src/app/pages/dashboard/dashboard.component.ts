import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  currentAssetChart: any[] = [];
  currentAsset = {};
  expenseChart:any[]= [];
  expenses = {};
  financialRatios:any ={};

  constructor(
    private chartOfAccountsService: ChartOfAccountsService,
  ) {}

  ngOnInit(): void {
    this.chartOfAccountsService.getAccounts().subscribe(
      data => {
        const currentAssetAccounts = data.filter((account: any) => account.subtype === 'Current Asset');
        const totalCurrentAsset = currentAssetAccounts.reduce((total: number, account: any) => total + (account.balance > 0 ? account.balance : 0), 0);
        this.currentAssetChart = currentAssetAccounts.map((account: any) => { 
          return { name: account.account_name, y: account.balance > 0 ? (account.balance/totalCurrentAsset * 100) : 0 }
        });
        this.currentAsset = this.getChartOptions(this.currentAssetChart, 'Current Asset Distribution', 'Percentage of current assets');
        const expenseAccounts = data.filter((account: any) => account.account_type === 'Expense');
        const totalExpenses = expenseAccounts.reduce((total: number, account: any) => total + (account.balance > 0 ? account.balance : 0), 0);
        this.expenseChart = expenseAccounts.map((account: any) => { 
          return { name: account.account_name, y: account.balance > 0 ? (account.balance/totalExpenses * 100) : 0 }
        });
        this.expenses = this.getChartOptions(this.expenseChart,'What Are Your Expenses?','Percentage of expenses');
      },
      error => {
        console.error('Error fetching accounts:', error);
      }
    );
    this.fetchFinancialRatios();
  }

  getChartOptions(value : any[], text?: string, subtitle?: string) {
    return {
      animationEnabled: true,
      theme: "light1",
      exportEnabled: true,
      title: {
        text
      },
      subtitles: [{
        text: subtitle
      }],
      data: [{
        type: "pie",
        indexLabel: "{name}: {y}%",
        dataPoints: value
      }]
    };
  }

  fetchFinancialRatios() {
    this.chartOfAccountsService.getFinancialRatios().subscribe(
      ratios => {
        this.financialRatios = ratios;
        console.log(this.financialRatios)
      },
      error => {
        console.error('Error fetching financial ratios:', error);
      }
    );
  }
}

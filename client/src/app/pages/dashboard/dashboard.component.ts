import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { TransactionService } from 'src/app/services/transaction.service';
import Lottie from 'lottie-web';
import animationData from '../../../assets/lottie/animation.json';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [],
})
export class DashboardComponent implements OnInit {
  currentAssetChart: any[] = [];
  currentAsset = {};
  expenseChart: any[] = [];
  expenses = {};
  financialRatios: any = {};
  hasTransactions: boolean = false;
  private animationItem: any;

  constructor(
    private chartOfAccountsService: ChartOfAccountsService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chartOfAccountsService.getAccounts().subscribe(
      (data) => {
        //Noel - Move the conversions to seperate functions
        const currentAssetAccounts = data.filter(
          (account: any) => account.subtype === 'Current Asset'
        );
        const totalCurrentAsset = currentAssetAccounts.reduce(
          (total: number, account: any) =>
            total + (account.balance > 0 ? account.balance : 0),
          0
        );
        this.currentAssetChart = currentAssetAccounts.map((account: any) => {
          return {
            name: account.account_name,
            y:
              account.balance > 0
                ? (account.balance / totalCurrentAsset) * 100
                : 0,
          };
        });
        this.currentAsset = this.getChartOptions(
          this.currentAssetChart,
          'Current Asset Distribution',
          'Percentage of current assets'
        );
        const expenseAccounts = data.filter(
          (account: any) => account.account_type === 'Expense'
        );
        const totalExpenses = expenseAccounts.reduce(
          (total: number, account: any) =>
            total + (account.balance > 0 ? account.balance : 0),
          0
        );
        this.expenseChart = expenseAccounts.map((account: any) => {
          return {
            name: account.account_name,
            y:
              account.balance > 0 ? (account.balance / totalExpenses) * 100 : 0,
          };
        });
        this.expenses = this.getChartOptions(
          this.expenseChart,
          'What Are Your Expenses?',
          'Percentage of expenses'
        );
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
    this.fetchFinancialRatios();
    this.checkForTransactions();
  }

  ngAfterViewInit(): void {
    const lottieContainer = document.getElementById('lottie');

    if (lottieContainer) {
      this.animationItem = Lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData as any,
      });
    } else {
      console.error('Lottie container not found');
    }
    this.cdr.detectChanges();
  }

  checkForTransactions(): void {
    this.transactionService.getTransactions().subscribe(
      (transactions) => {
        this.hasTransactions = transactions && transactions.length > 0;
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );
  }

  ngOnDestroy() {
    this.animationItem.destroy();
  }

  getChartOptions(value: any[], text?: string, subtitle?: string) {
    return {
      animationEnabled: true,
      theme: 'light1',
      exportEnabled: true,
      title: {
        text,
      },
      subtitles: [
        {
          text: subtitle,
        },
      ],
      data: [
        {
          type: 'pie',
          indexLabel: '{name}: {y}%',
          dataPoints: value,
        },
      ],
    };
  }

  fetchFinancialRatios() {
    this.chartOfAccountsService.getFinancialRatios().subscribe(
      (ratios) => {
        this.financialRatios = ratios;
        console.log(this.financialRatios);
      },
      (error) => {
        console.error('Error fetching financial ratios:', error);
      }
    );
  }
}

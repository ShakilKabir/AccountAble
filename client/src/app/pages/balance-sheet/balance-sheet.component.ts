import { Component, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-balance-sheet',
  templateUrl: './balance-sheet.component.html',
  styles: [
  ]
})
export class BalanceSheetComponent implements OnInit {
  assets: any[] = [];
  liabilities: any[] = [];
  equity: any[] = [];
  totalAssets: number = 0;
totalLiabilities: number = 0;
totalEquity: number = 0;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadBalanceSheet();
  }

  loadBalanceSheet(): void {
    this.transactionService.getBalanceSheet().subscribe(data => {
      this.assets = [
        { name: 'Total Cash and Bank', balance: data.totalCash },
        { name: 'Total Other Current Assets', balance: data.totalOtherCurrentAsset },
        { name: 'Total Long-term Assets', balance: data.totalLongTermAssets }
      ];
      
      this.liabilities = [
        { name: 'Total Current Liabilities', balance: data.totalCurrentLiabilities },
        { name: 'Total Long-term Liabilities', balance: data.totalLongTermLiabilities }
      ];
  
      this.equity = [
        { name: 'Total Owner’s Capital', balance: data.totalOwnerCapital },
        { name: 'Total Retained Earnings', balance: data.totalRetainedEarnings },
        { name: 'Total Other Equity', balance: data.totalOtherEquity },
      ];

      this.totalAssets = this.assets.reduce((acc, asset) => acc + asset.balance, 0);
      this.totalLiabilities = this.liabilities.reduce((acc, liability) => acc + liability.balance, 0);
      this.totalEquity = this.equity.reduce((acc, equityItem) => acc + equityItem.balance, 0);
  }, error => {
      console.error('Error fetching balance sheet data', error);
    });
  }
  
}

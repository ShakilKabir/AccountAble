import { Component, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
reportDate: string = '';

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadBalanceSheet();
    this.reportDate = new Date().toISOString().split('T')[0];
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
  loadBalanceSheetByDate(): void {
    this.transactionService.getBalanceSheetByDate(this.reportDate).subscribe(
      data => {
        // Update assets array
        this.assets = [
          { name: 'Total Cash and Bank', balance: data.totalCash },
          { name: 'Total Other Current Assets', balance: data.totalOtherCurrentAsset },
          { name: 'Total Long-term Assets', balance: data.totalLongTermAssets }
        ];
  
        // Update liabilities array
        this.liabilities = [
          { name: 'Total Current Liabilities', balance: data.totalCurrentLiabilities },
          { name: 'Total Long-term Liabilities', balance: data.totalLongTermLiabilities }
        ];
  
        // Update equity array
        this.equity = [
          { name: 'Total Owner’s Capital', balance: data.totalOwnerCapital },
          { name: 'Total Retained Earnings', balance: data.totalRetainedEarnings },
          { name: 'Total Other Equity', balance: data.totalOtherEquity },
        ];
  
        // Update total values
        this.totalAssets = data.totalAssets;
        this.totalLiabilities = data.totalLiabilities;
        this.totalEquity = data.totalOwnerCapital + data.totalRetainedEarnings + data.totalOtherEquity;
  
        // You might want to handle netIncome if you need to display it or use it in calculations
        // For example:
        // this.netIncome = data.netIncome;
      },
      error => {
        console.error('Error fetching balance sheet data by date', error);
      }
    );
  }
  
  
  onUpdateReport(): void {
    this.loadBalanceSheetByDate();
  }

  exportAsPDF(divId: string) {
    const data = document.getElementById(divId);
    html2canvas(data!).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('balance-sheet.pdf');
    });
  }

}

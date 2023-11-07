import { Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { TransactionService } from 'src/app/services/transaction.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-cash-flow-statement',
  templateUrl: './cash-flow-statement.component.html',
})
export class CashFlowStatementComponent implements OnInit {
  cashFlowData: any = {
    openingBalance: 0,
    cashFlowFromOperatingActivities: 0,
    cashFlowFromInvestingActivities: 0,
    cashFlowFromFinancingActivities: 0,
    grossCashInflow: 0,
    grossCashOutflow: 0,
    closingBalance: 0,
  };

  startDate: string='';
  endDate: string='';
  tempStartDate: string = '';
  tempEndDate: string = '';
  
  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    const currentDate = new Date();
    this.endDate = this.tempEndDate = currentDate.toISOString().split('T')[0];
    this.startDate = this.tempStartDate = new Date(
      currentDate.getFullYear(),
      0,
      1
    ).toLocaleDateString('sv-SE');

    this.updateReport(this.startDate, this.endDate);
  }
  updateReport(startDate?: string, endDate?: string) {
    this.transactionService.getCashFlowStatement(startDate, endDate).subscribe(
      data => {
        this.cashFlowData = data;
        console.log('Cash flow statement retrieved successfully', data)
      },
      error => {
        console.error('There was an error retrieving the cash flow statement', error);
      }
    );
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
      pdf.save('cash-flow-statement.pdf');
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { TransactionService } from 'src/app/services/transaction.service';

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
  
  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    // Set default date range from the start of the current year to today
    const currentDate = new Date();
    this.startDate = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE', { timeZone: 'Asia/Dhaka' });
    this.endDate = currentDate.toISOString().split('T')[0];

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
}

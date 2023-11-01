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
  
  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.updateReport();
  }

  updateReport() {
    this.transactionService.getCashFlowStatement().subscribe(
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

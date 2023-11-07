//app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts.component';
import { IncomeStatementComponent } from './pages/income-statement/income-statement.component';
import { CashFlowStatementComponent } from './pages/cash-flow-statement/cash-flow-statement.component';
import { BalanceSheetComponent } from './pages/balance-sheet/balance-sheet.component';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { JournalEntryComponent } from './pages/journal-entry/journal-entry.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'register', component: RegisterFormComponent },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'transactions',
        component: TransactionsComponent,
      },
      {
        path: 'chart-of-accounts',
        component: ChartOfAccountsComponent
      },
      {
        path: 'income-statement',
        component: IncomeStatementComponent
      },
      {
        path: 'cash-flow-statement',
        component: CashFlowStatementComponent
      },
      {
        path: 'balance-sheet',
        component: BalanceSheetComponent
      },
      {
        path: 'invoice',
        component: InvoiceComponent
      },
      {
        path: 'journal-entry',
        component: JournalEntryComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

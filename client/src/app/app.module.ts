//app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginFormComponent } from './pages/login-form/login-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterFormComponent } from './pages/register-form/register-form.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { HeroComponent } from './components/hero/hero.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { ChartOfAccountsComponent } from './pages/chart-of-accounts/chart-of-accounts.component';
import { IncomeStatementComponent } from './pages/income-statement/income-statement.component';
import { CashFlowStatementComponent } from './pages/cash-flow-statement/cash-flow-statement.component';
import { BalanceSheetComponent } from './pages/balance-sheet/balance-sheet.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { JournalEntryComponent } from './pages/journal-entry/journal-entry.component';
import { TransactionDetailModalComponent } from './components/transaction-detail-modal/transaction-detail-modal.component';
import { PaymentsComponent } from './pages/payments/payments.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    RegisterFormComponent,
    DashboardComponent,
    NavbarComponent,
    HomeComponent,
    HeroComponent,
    TransactionsComponent,
    TransactionFormComponent,
    SidebarComponent,
    AuthLayoutComponent,
    ChartOfAccountsComponent,
    IncomeStatementComponent,
    CashFlowStatementComponent,
    BalanceSheetComponent,
    InvoiceComponent,
    JournalEntryComponent,
    TransactionDetailModalComponent,
    PaymentsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    CanvasJSAngularChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

//services/chart-of-accounts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChartOfAccountsService {
  private apiUrl = 'http://localhost:3000/api/chart-of-accounts';
  private ratiosUrl = 'http://localhost:3000/api/financial-ratios';

  constructor(private http: HttpClient) {}

// Fetch all accounts
getAccounts(): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
    })
  };
  return this.http.get(this.apiUrl, httpOptions);
}

// Add a new account
addAccount(accountData: any): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
    })
  };
  return this.http.post(this.apiUrl, accountData, httpOptions);
}

getFinancialRatios() {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
    })
  };
  return this.http.get<any>(this.ratiosUrl, httpOptions);
}

}

//services/transaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    return this.http.get(this.apiUrl, httpOptions);
  }

  addTransaction(transaction: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    return this.http.post(this.apiUrl, transaction, httpOptions);
  }

  updateTransactionStatus(
    transactionId: string,
    isPaidOrReceived: boolean
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    return this.http.patch(
      `${this.apiUrl}/${transactionId}/status`,
      { isPaidOrReceived },
      httpOptions
    );
  }

  deleteTransaction(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }

  getIncomeStatement(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    return this.http.get(`${this.apiUrl}/income-statement`, httpOptions);
  }

  getCashFlowStatement(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
      params: params,
    };
    return this.http.get(`${this.apiUrl}/cash-flow-statement`, httpOptions);
  }

  getBalanceSheet(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
    };
    return this.http.get(`${this.apiUrl}/balance-sheet`, httpOptions);
  }

  getBalanceSheetByDate(date: string): Observable<any> {
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token':
          JSON.parse(localStorage.getItem('currentUser') || '{}').token || '',
      }),
      params: new HttpParams().set('date', formattedDate),
    };
    return this.http.get(`${this.apiUrl}/balance-sheet-by-date`, httpOptions);
  }
}

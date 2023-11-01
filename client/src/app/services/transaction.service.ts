//services/transaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:3000/api/transactions';


  constructor(private http: HttpClient) { }

  getTransactions(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
      })
    };
    return this.http.get(this.apiUrl, httpOptions);
  }
  
  addTransaction(transaction: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
      })
    };
    return this.http.post(this.apiUrl, transaction, httpOptions);
  }
  
  deleteTransaction(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
      })
    };
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }

  getIncomeStatement(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
      })
    };
    return this.http.get(`${this.apiUrl}/income-statement`, httpOptions);
  }
  
  getCashFlowStatement(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-access-token': JSON.parse(localStorage.getItem('currentUser') || '{}').token || ''
      })
    };
    return this.http.get(`${this.apiUrl}/cash-flow-statement`, httpOptions)
  }


}

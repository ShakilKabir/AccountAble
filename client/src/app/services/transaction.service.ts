//services/transaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:3000/api/transactions'; // Assuming your backend is running on port 3000



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
  


  // You can add more methods here to handle other CRUD operations
}

//navbar.component.html

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {
  userEmail: string = '';
  dropdownOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userEmail = this.authService.currentUserValue?.email || '';
    console.log('Current user:', this.authService.currentUserValue);
    console.log('Email:', this.userEmail);
  }
  
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

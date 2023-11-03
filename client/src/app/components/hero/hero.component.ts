//hero.component.ts

import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ConfirmPasswordValidator } from 'src/app/validators/confirm-password.validator';
import Lottie from 'lottie-web';
import animationData from '../../../assets/lottie/hero.json'


@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styles: [
  ]
})
export class HeroComponent {
  heroRegisterForm!: FormGroup;
  private animationItem: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.heroRegisterForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: ConfirmPasswordValidator });
  }

  ngAfterViewInit(): void {
    const lottieContainer = document.getElementById('lottie');
    
    if (lottieContainer) {
      this.animationItem = Lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData as any,
      });
    } else {
      console.error('Lottie container not found');
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.animationItem.destroy();
  }

  onSubmit() {
    if (this.heroRegisterForm.valid) {
      this.authService.register(this.heroRegisterForm.value).subscribe(response => {
        // Handle response here
        this.router.navigate(['/login']);
      }, error => {
        // Handle errors here
      });
    }
  }
}

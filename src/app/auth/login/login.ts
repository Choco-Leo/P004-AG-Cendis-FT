import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alert: AlertService
  ) {
    this.loginForm = this.fb.group({
      login_cendi: ['', Validators.required],
      password_cendi: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { login_cendi, password_cendi } = this.loginForm.value;
      this.authService.login({login_cendi, password_cendi}).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['Dashbord']);
          } else {
            this.alert.show(response.message ?? 'Credenciales inválidas', 'error');
          }
        },
        error: (err) => {
          const message = err?.error?.message ?? err.message ?? 'Error al iniciar sesión';
          this.alert.show(message, 'error');
        }
      });
    }
  }
}

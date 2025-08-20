import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  credentials = { email: '', password: '' };
  isActive = false;
  loading = false;
  message = '';
  isError = false;

  showPassword = false;

  constructor(private userService: UserService, private router: Router) {}

  toggleActive(state: boolean): void {
    this.isActive = state;
    this.message = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(loginForm: NgForm): void {
    if (loginForm.invalid) {
      this.showMessage('Please enter both email and password', true);
      return;
    }

    this.loading = true;
    this.message = '';

    this.userService.login(this.credentials).subscribe({
      next: (response) => {
        // Store the user and tokens from backend response
        if (response && response.user) {
          this.userService.storeUserData(response.user, response.token, response.refreshToken);
        }
        this.showMessage('Admin login successful! Redirecting...', false);
        setTimeout(() => {
          this.router.navigate(['/admin-portal']);
        }, 1500);
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Invalid admin credentials';
        this.showMessage(errorMsg, true);
        this.loading = false;
      }
    });
  }

  private showMessage(message: string, isError: boolean): void {
    this.message = message;
    this.isError = isError;
    setTimeout(() => {
      if (this.message === message) {
        this.message = '';
      }
    }, 5000);
  }
}
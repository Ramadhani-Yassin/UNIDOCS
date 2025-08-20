import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoginForm = true;
  isActive = false;
  credentials = { email: '', password: '' };
  user = { firstName: '', lastName: '', email: '', password: '' };
  loading = false;
  message = '';
  isError = false;

  // Password visibility
  showLoginPassword = false;
  showSignupPassword = false;

  constructor(private userService: UserService, private router: Router) {}

  toggleForm(isLogin: boolean): void {
    this.isLoginForm = isLogin;
    this.isActive = !isLogin;
    this.message = '';
  }

  toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleSignupPassword(): void {
    this.showSignupPassword = !this.showSignupPassword;
  }

  onLoginSubmit(loginForm: NgForm): void {
    if (loginForm.invalid) {
      this.showMessage('Please enter both email and password ‼️', true);
      return;
    }

    this.loading = true;
    this.message = '';

    this.userService.studentLogin(this.credentials).subscribe({
      next: (response) => {
        // Store the user and tokens from backend response
        if (response && response.user) {
          this.userService.storeUserData(response.user, response.token, response.refreshToken);
        }
        this.showMessage('Login successful! Redirecting..✅', false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        if (error.status === 403 && error.error?.error?.includes('suspended')) {
          this.showMessage('Your account is suspended. Please contact the Admin.', true);
        } else {
          const errorMsg = error.error?.error || 'Invalid credentials ❌';
          this.showMessage(errorMsg, true);
        }
        this.loading = false;
      }
    });
  }

  onSignupSubmit(signupForm: NgForm): void {
    if (signupForm.invalid) {
      this.showMessage('Please fill all required fields', true);
      return;
    }

    this.loading = true;
    this.message = '';

    const userData = {
      firstName: this.user.firstName.trim(),
      lastName: this.user.lastName.trim(),
      email: this.user.email.trim(),
      password: this.user.password.trim(),
      role: 'student'
    };

    this.userService.register(userData).subscribe({
      next: () => {
        this.showMessage('Registration successful! Please login.', false);
        setTimeout(() => {
          this.toggleForm(true);
          signupForm.resetForm();
        }, 1500);
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Registration failed. Invalid Email or Already used.';
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
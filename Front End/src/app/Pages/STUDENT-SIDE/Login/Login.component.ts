import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  isLoginForm = true;
  credentials = { email: '', password: '' };
  user = { firstName: '', lastName: '', email: '', password: '' };
  isActive = false;
  loading = false;
  message = '';
  isError = false;
  registrationSuccessful = false;
  loginFailed = false;

  constructor(private userService: UserService, private router: Router) {}

  toggleForm(isLogin: boolean): void {
    this.isLoginForm = isLogin;
    this.isActive = !isLogin;
    this.message = '';
  }

  onLoginSubmit(loginForm: NgForm): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.setMessage('❌ Email and password are required!', true);
      return;
    }

    this.loading = true;
    this.userService.login(this.credentials).subscribe({
      next: (response: any) => {
        if (response?.message === 'Login successful') {
          this.setMessage('✔️ Successfully logged in!', false);
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        } else {
          this.setMessage('❌ Invalid credentials!', true);
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.setMessage(
          error.error?.message || '❌ Invalid credentials!',
          true
        );
        this.loading = false;
      },
    });
  }

  onSignupSubmit(signupForm: NgForm): void {
    if (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      !this.user.password
    ) {
      this.setMessage('❌ All fields are required!', true);
      return;
    }

    this.loading = true;
    this.userService.signup(this.user).subscribe({
      next: (response: any) => {
        if (response?.message === 'User registered successfully') {
          this.setMessage('✔️ Registration successful!', false);
          setTimeout(() => {
            this.toggleForm(true);
            signupForm.resetForm();
            this.registrationSuccessful = false;
          }, 1500);
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.setMessage(error.error?.message || '❌ Email already in use or invalid!', true);
        this.loading = false;
      },
    });
  }

  private setMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
    this.loginFailed = isError;
  }
}

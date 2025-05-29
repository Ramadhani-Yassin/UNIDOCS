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
  credentials = { email: '', password: '', role: 'admin' };
  isActive = false;
  loading = false;
  message = '';
  isError = false;

  constructor(private userService: UserService, private router: Router) {}

  toggleActive(state: boolean): void {
    this.isActive = state;
    this.message = ''; // Clear messages when toggling
  }

  onSubmit(loginForm: NgForm): void {
    if (loginForm.invalid) {
      this.showMessage('Please enter both email and password', true);
      return;
    }

    this.loading = true;
    this.message = ''; // Clear previous messages

    this.userService.login(this.credentials).subscribe({
      next: (response) => {
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
      if (this.message === message) { // Only clear if it's the same message
        this.message = '';
      }
    }, 5000);
  }
}
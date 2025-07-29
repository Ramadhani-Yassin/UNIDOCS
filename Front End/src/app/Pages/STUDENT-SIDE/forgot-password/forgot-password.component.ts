import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PasswordResetService } from '../../../services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  message = '';
  isError = false;
  isSuccess = false;

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router
  ) { }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.showMessage('Please enter a valid email address', true);
      return;
    }

    this.loading = true;
    this.message = '';

    this.passwordResetService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.showMessage('If an account with this email exists, a password reset link has been sent to your email.', false);
        this.isSuccess = true;
        this.loading = false;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to process request. Please try again.';
        this.showMessage(errorMsg, true);
        this.loading = false;
      }
    });
  }

  private showMessage(message: string, isError: boolean): void {
    this.message = message;
    this.isError = isError;
    this.isSuccess = !isError;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
} 
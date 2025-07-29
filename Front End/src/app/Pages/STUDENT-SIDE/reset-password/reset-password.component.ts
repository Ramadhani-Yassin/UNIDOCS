import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PasswordResetService } from '../../../services/password-reset.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetToken = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  validating = false;
  message = '';
  isError = false;
  isSuccess = false;
  tokenValid = false;
  passwordRequirements = '';

  constructor(
    private passwordResetService: PasswordResetService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (this.resetToken) {
        this.validateToken();
      } else {
        this.showMessage('Invalid reset link. Please request a new password reset.', true);
      }
    });

    // Get password requirements
    this.passwordResetService.getPasswordRequirements().subscribe({
      next: (response) => {
        this.passwordRequirements = response.requirements;
      },
      error: (error) => {
        console.error('Failed to get password requirements:', error);
      }
    });
  }

  validateToken(): void {
    this.validating = true;
    this.passwordResetService.validateResetToken(this.resetToken).subscribe({
      next: (response) => {
        this.tokenValid = response.valid;
        this.validating = false;
        if (!this.tokenValid) {
          this.showMessage('This reset link has expired or is invalid. Please request a new password reset.', true);
        }
      },
      error: (error) => {
        this.tokenValid = false;
        this.validating = false;
        this.showMessage('Failed to validate reset link. Please try again.', true);
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.showMessage('Please fill in all fields correctly.', true);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('Passwords do not match.', true);
      return;
    }

    if (!this.tokenValid) {
      this.showMessage('Invalid reset link. Please request a new password reset.', true);
      return;
    }

    this.loading = true;
    this.message = '';

    this.passwordResetService.resetPassword(this.resetToken, this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        this.showMessage('Password reset successfully! You can now login with your new password.', false);
        this.isSuccess = true;
        this.loading = false;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to reset password. Please try again.';
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

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  hasSpecialCharacter(password: string): boolean {
    if (!password) return false;
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialChars.test(password);
  }

  hasMinLength(password: string): boolean {
    return !!(password && password.length >= 8);
  }

  hasUppercase(password: string): boolean {
    if (!password) return false;
    return /[A-Z]/.test(password);
  }

  hasLowercase(password: string): boolean {
    if (!password) return false;
    return /[a-z]/.test(password);
  }

  hasDigit(password: string): boolean {
    if (!password) return false;
    return /\d/.test(password);
  }
} 
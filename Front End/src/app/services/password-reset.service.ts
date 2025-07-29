import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = 'http://localhost:8088/api/users';

  constructor(private http: HttpClient) { }

  // Request password reset
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // Reset password with token
  resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      resetToken,
      newPassword,
      confirmPassword
    });
  }

  // Validate reset token
  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset-token?token=${token}`);
  }

  // Get password requirements
  getPasswordRequirements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/password-requirements`);
  }
} 
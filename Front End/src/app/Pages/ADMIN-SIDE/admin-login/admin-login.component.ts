import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  isActive: boolean = false;
  loading: boolean = false;
  message: string = ''; // Success or error message
  isError: boolean = false; // Flag to check if it's an error

  constructor(private http: HttpClient, private router: Router) {}

  toggleActive(isActive: boolean): void {
    this.isActive = isActive;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.message = '❌ Email and password are required!';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.message = ''; // Clear previous messages

    const adminCredentials = {
      email: this.email.trim(),
      password: this.password,
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http
      .post<{ message: string; token?: string }>(
        'http://localhost:8088/api/admin/login',
        adminCredentials,
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Login Response:', response);

          if (response.token) {
            sessionStorage.setItem('adminToken', response.token); // Store token
          }

          this.message = '✔️ Successfully logged in as Admin!';
          this.isError = false;

          setTimeout(() => {
            this.router.navigate(['/admin-portal']);
          }, 1500); // Redirect after 1.5 seconds

          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Login Error:', err);

          this.message = err.error?.message || '❌ Invalid admin credentials!';
          this.isError = true;
          this.loading = false;
        },
      });
  }
}

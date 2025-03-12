import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Toggle the active state (if needed for UI changes)
  toggleActive(isActive: boolean): void {
    this.isActive = isActive;
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = ''; // Clear previous errors

    const admin = {
      email: this.email,
      password: this.password,
    };

    this.http
      .post<{ token: string }>('http://localhost:8080/api/admin/login', admin)
      .subscribe(
        (response) => {
          localStorage.setItem('adminToken', response.token); // Save token
          alert('Login successful');
          this.router.navigate(['/admin-dashboard']); // Redirect after login
        },
        (error) => {
          this.errorMessage =
            error.error?.message || 'Invalid admin credentials'; // Improved error message
          this.loading = false; // Stop loading
        }
      );
  }
}

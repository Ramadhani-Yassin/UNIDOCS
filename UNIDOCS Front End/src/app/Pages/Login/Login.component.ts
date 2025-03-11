import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoginForm: boolean = true; // Toggle between login and signup forms
  credentials = { email: '', password: '' }; // For login form
  user = { firstName: '', lastName: '', email: '', password: '' }; // For signup form
  loginFailed: boolean = false; // To show login error message
  registrationSuccessful: boolean = false; // To show signup success message
  isActive: boolean = false; // Added isActive property

  constructor(private userService: UserService, private router: Router) {}

  // Toggle between login and signup forms
  toggleForm(isLogin: boolean): void {
    this.isLoginForm = isLogin;
    this.isActive = !isLogin; // Toggle isActive based on the form state
  }

  // Handle login form submission
  onLoginSubmit(loginForm: NgForm): void {
    if (loginForm.valid) {
      this.userService.login(this.credentials).subscribe(
        (response: any) => {
          console.log('Login response', response);
          if (response && response.message === 'Login successful') {
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 3000);
          } else {
            this.loginFailed = true;
          }
        },
        (error: any) => {
          console.error('Error logging in', error);
          if (error.status === 401) {
            this.loginFailed = true;
          } else {
            console.error('An error occurred while logging in');
          }
        }
      );
    }
  }

  // Handle signup form submission
  onSignupSubmit(signupForm: NgForm): void {
    if (signupForm.valid) {
      this.userService.signup(this.user).subscribe(
        (response: any) => {
          console.log('Signup response', response);
          if (response && response.message === 'User registered successfully') {
            this.registrationSuccessful = true;
            setTimeout(() => {
              this.toggleForm(true); // Toggle to login form
              this.registrationSuccessful = false;
              signupForm.resetForm(); // Reset the signup form
            }, 3000);
          }
        },
        (error: any) => {
          console.error('Error signing up', error);
        }
      );
    }
  }
}
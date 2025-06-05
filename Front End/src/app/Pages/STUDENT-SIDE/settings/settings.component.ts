import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input() sidebarService: any;

  // Form properties
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  currentPassword: string = '';
  userId: number | null = null;

  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'success';
  successMessage: string = 'Profile updated successfully!';
  errorMessage: string = 'Error updating profile. Please try again.';
  
  // Loading state
  isLoading: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
    }

    // Optional: Log sidebar state for debugging
    if (this.sidebarService && this.sidebarService.isOpen$) {
      this.sidebarService.isOpen$.subscribe((isOpen: boolean) => {
        console.log('Sidebar is open:', isOpen);
      });
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.showAlert = false;

    // Simple email validation
    if (!this.email.includes('@')) {
      this.isLoading = false;
      this.showAlert = true;
      this.alertType = 'danger';
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!this.currentPassword) {
      this.isLoading = false;
      this.showAlert = true;
      this.alertType = 'danger';
      this.errorMessage = 'Password is required to save changes.';
      return;
    }

    const updateData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      currentPassword: this.currentPassword
    };

    if (!this.userId) {
      this.isLoading = false;
      this.showAlert = true;
      this.alertType = 'danger';
      this.errorMessage = 'User not found.';
      return;
    }

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showAlert = true;
        this.alertType = 'success';
        this.successMessage = 'Profile updated successfully!';
        this.userService.storeUserData(res); // Update local storage
      },
      error: (err) => {
        this.isLoading = false;
        this.showAlert = true;
        this.alertType = 'danger';
        this.errorMessage = err.error?.error || 'Error updating profile. Please try again.';
      }
    });
  }

  resetForm() {
    this.ngOnInit();
    this.currentPassword = '';
  }

  toggleSidebar() {
    if (this.sidebarService && this.sidebarService.toggle) {
      this.sidebarService.toggle();
    }
  }
}
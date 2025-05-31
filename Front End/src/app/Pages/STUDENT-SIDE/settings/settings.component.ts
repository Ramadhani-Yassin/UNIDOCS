import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentSidebarService } from '../../../services/student-sidebar.service'; // Updated import

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // Form properties
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  currentPassword: string = '';
  isEmailVerified: boolean = false;
  
  // Alert properties
  showAlert: boolean = false;
  alertType: string = 'success';
  successMessage: string = 'Profile updated successfully!';
  errorMessage: string = 'Error updating profile. Please try again.';
  
  // Loading state
  isLoading: boolean = false;

  constructor(public sidebarService: StudentSidebarService) {} // Updated service injection

  ngOnInit() {
    // Example data - in a real app, you would get this from a service
    this.firstName = 'John';
    this.lastName = 'Doe';
    this.email = 'john.doe@suza.ac.tz';
    this.isEmailVerified = true;

    // Optional: Log sidebar state for debugging
    this.sidebarService.isOpen$.subscribe(isOpen => {
      console.log('Sidebar is open:', isOpen);
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.showAlert = true;
    this.alertType = 'success';
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // In a real app, you would handle the form submission here
      console.log('Form submitted:', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        currentPassword: this.currentPassword
      });
    }, 1500);
  }

  resetForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.currentPassword = '';
  }

  // Optional: Add method to toggle sidebar if needed
  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
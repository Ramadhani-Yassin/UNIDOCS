import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  isActive: boolean = false;

  // Toggle the active state
  toggleActive(isActive: boolean): void {
    this.isActive = isActive;
  }
}
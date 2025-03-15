import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  status = false;

  constructor(private router: Router) {}

  addToggle() {
    this.status = !this.status;
  }

  confirmLogout(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior

    const confirmLogout = confirm('Do you really want to log out of UNIDOCS?');

    if (confirmLogout) {
      this.router.navigate(['/home']); // Redirect to home
    }
    // If "No", user stays on the same page (no action needed)
  }
}

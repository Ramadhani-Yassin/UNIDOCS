import { Component } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent {
  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router
  ) {}

  confirmLogout(event: Event) {
    event.preventDefault();
    const confirmLogout = confirm('Do you really want to log out of UNIDOCS?');
    if (confirmLogout) {
      this.router.navigate(['/home']);
    }
  }
}



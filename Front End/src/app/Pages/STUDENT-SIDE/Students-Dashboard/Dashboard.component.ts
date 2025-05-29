import { Component, OnInit } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service'; // ✅ import this

@Component({
  selector: 'app-students',
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  fullName: string = 'Loading...'; // ✅ Placeholder

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router,
    private userService: UserService // ✅ inject service
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || 'User';
    } else {
      this.fullName = 'Guest';
    }
  }

  confirmLogout(event: Event) {
    event.preventDefault();
    const confirmLogout = confirm('Do you really want to log out of UNIDOCS?');
    if (confirmLogout) {
      this.router.navigate(['/home']);
    }
  }
}

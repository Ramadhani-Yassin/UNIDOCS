import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { LetterRequestService, LetterRequest } from '../../../services/letter-request.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-students',
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  fullName: string = 'Loading...';
  requestCount: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  recentRequests: LetterRequest[] = [];
  recentRequestsLoading: boolean = true;

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router,
    private userService: UserService,
    private letterRequestService: LetterRequestService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadRequestCount();
    this.loadRecentRequests();
  }

  private loadUserData(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.fullName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || 'User';
    } else {
      this.fullName = 'Guest';
    }
  }

  private loadRequestCount(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.letterRequestService.getLetterRequestCount().subscribe({
      next: (count) => {
        this.requestCount = count;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load request count', err);
        this.errorMessage = 'Failed to load request count';
        this.isLoading = false;
      }
    });
  }

  private loadRecentRequests(): void {
    this.recentRequestsLoading = true;

    this.letterRequestService.getRecentLetterRequests().subscribe({
      next: (requests) => {
        this.recentRequests = requests;
        this.recentRequestsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load recent requests', err);
        this.recentRequestsLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return 'approved';
      case 'DECLINED': return 'declined';
      case 'PENDING': return 'pending';
      default: return 'completed';
    }
  }

  formatDate(dateString: string): string {
    // Attempt to parse the date safely
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid Date';
      }

      return parsedDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\//g, '-');
    } catch (e) {
      return 'Invalid Date';
    }
  }

  goToApplication(): void {
    this.router.navigate(['/application']);
  }

  confirmLogout(event: Event): void {
    event.preventDefault();
    const confirmLogout = confirm('Do you really want to log out of UNIDOCS?');
    if (confirmLogout) {
      this.router.navigate(['/home']);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { LetterRequestService, LetterRequest } from '../../../services/letter-request.service';
import { UserService } from '../../../services/user.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-students',
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  fullName: string = 'Loading...';
  requestCount: number = 0;
  animatedRequestCount: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  recentRequests: LetterRequest[] = [];
  recentRequestsLoading: boolean = true;
  private requestCountSub?: Subscription;

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
        this.animateRequestCount(count);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load request count', err);
        this.errorMessage = 'Failed to load request count';
        this.isLoading = false;
      }
    });
  }

  private animateRequestCount(target: number) {
    const duration = 1000; // ms
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;

    if (this.requestCountSub) this.requestCountSub.unsubscribe();

    this.animatedRequestCount = 0;
    this.requestCountSub = interval(1000 / frameRate).subscribe(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      this.animatedRequestCount = Math.floor(progress * target);

      if (progress === 1) {
        this.animatedRequestCount = target;
        this.requestCountSub?.unsubscribe();
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

  formatDate(date: any): string {
    try {
      // If date is an array: [year, month, day, hour, minute, second, nano]
      if (Array.isArray(date) && date.length >= 6) {
        const jsDate = new Date(
          date[0],           // year
          date[1] - 1,       // month (0-based)
          date[2],           // day
          date[3],           // hour
          date[4],           // minute
          date[5],           // second
          Math.floor(date[6] / 1000000) // nanoseconds to milliseconds
        );
        return jsDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(/\//g, '-');
      }
      // Fallback for string dates
      if (typeof date === 'string') {
        if (date && !date.endsWith('Z') && !date.includes('+')) {
          date = date + 'Z';
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return date;
        }
        return parsedDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(/\//g, '-');
      }
      return '-';
    } catch {
      return '-';
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

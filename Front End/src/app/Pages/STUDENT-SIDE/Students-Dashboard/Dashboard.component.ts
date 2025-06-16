import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

  // Modal and letter viewing properties
  showLetterModal = false;
  letterUrl: SafeResourceUrl | null = null;
  letterLoading = false;
  letterError = '';
  selectedRequest: LetterRequest | null = null;
  showLetterSpinner: boolean = false;

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router,
    private userService: UserService,
    private letterRequestService: LetterRequestService,
    private sanitizer: DomSanitizer
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

  refreshRecentRequests(): void {
    this.loadRecentRequests();
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
      if (Array.isArray(date) && date.length >= 3) {
        const jsDate = new Date(
          date[0],           // year
          date[1] - 1,       // month (0-based)
          date[2]            // day
        );
        return jsDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
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
        return parsedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
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

  openLetterModal(request: LetterRequest) {
    this.selectedRequest = request;
    this.showLetterModal = true;
    this.letterLoading = true;
    this.letterError = '';
    this.letterUrl = null;

    this.letterRequestService.getGeneratedLetter(request.id, 'pdf').subscribe({
      next: (blob: Blob) => {
        this.letterUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.letterLoading = false;
      },
      error: (err) => {
        this.letterError = 'Failed to load letter.';
        this.letterLoading = false;
      }
    });
  }

  closeLetterModal() {
    // Open in new tab before closing modal
    if (this.letterUrl) {
      const url = (this.letterUrl as any).changingThisBreaksApplicationSecurity || this.letterUrl;
      window.open(url, '_blank');
    }
    this.showLetterModal = false;
    this.letterUrl = null;
    this.selectedRequest = null;
  }

  downloadLetter() {
    if (!this.selectedRequest) return;
    this.letterRequestService.getGeneratedLetter(this.selectedRequest.id, 'pdf').subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'letter.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  openLetterInNewTab(request: LetterRequest) {
    this.letterLoading = true; // Show spinner
    this.showLetterSpinner = true; // New property to control spinner modal

    this.letterRequestService.getGeneratedLetter(request.id, 'pdf').subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        this.letterLoading = false;
        this.showLetterSpinner = false;
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      error: () => {
        this.letterLoading = false;
        this.showLetterSpinner = false;
        alert('Failed to load letter.');
      }
    });
  }

  openCurrentLetterInNewTab() {
    if (!this.letterUrl) return;
    // letterUrl is a SafeResourceUrl, so we need to extract the actual URL string
    const url = (this.letterUrl as any).changingThisBreaksApplicationSecurity || this.letterUrl;
    window.open(url, '_blank');
  }
}

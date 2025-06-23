import { Component, OnInit } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { LetterRequestService, LetterRequest } from '../../../services/letter-request.service';
import { UserService } from '../../../services/user.service'; // Add this import

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  myApplications: LetterRequest[] = [];
  myApplicationsLoading = true;
  localSearchTerm: string = '';

  constructor(
    public sidebarService: StudentSidebarService,
    private letterRequestService: LetterRequestService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    this.loadMyApplications();
  }

  loadMyApplications(): void {
    this.myApplicationsLoading = true;
    this.letterRequestService.getAllMyLetterRequests().subscribe({
      next: (requests: LetterRequest[]) => {
        this.myApplications = requests;
        this.myApplicationsLoading = false;
      },
      error: () => {
        this.myApplications = [];
        this.myApplicationsLoading = false;
      }
    });
  }

  refreshApplications(): void {
    this.loadMyApplications();
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
        // JS months are 0-based, Java months are 1-based
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
      // Fallback to previous logic for string dates
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

  onLocalSearchChange() {
    // No need for a shared service, just local filtering
  }

  get filteredApplications() {
    if (!this.localSearchTerm) return this.myApplications;
    const term = this.localSearchTerm.toLowerCase();
    return this.myApplications.filter(r =>
      (r.letterType && r.letterType.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term)) ||
      (r.adminComment && r.adminComment.toLowerCase().includes(term))
    );
  }

  openLetterInNewTab(request: LetterRequest) {
    this.letterRequestService.getGeneratedLetter(request.id, 'pdf').subscribe({
      next: (blob: Blob) => {
        // Get user's first and last name for filename
        const user = this.userService.getCurrentUser();
        const firstName = user?.firstName || 'User';
        const lastName = user?.lastName || '';
        const fileName = `${firstName}_${lastName}_letter.pdf`;

        const url = window.URL.createObjectURL(blob);
        // Open the PDF in a new tab for viewing
        const newTab = window.open(url, '_blank');
        // Optionally, revoke the object URL after some time
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);

        // Optionally, if you want to force download with custom filename, use the anchor trick:
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = fileName;
        // a.click();
      },
      error: () => {
        alert('Failed to load letter.');
      }
    });
  }

  displayLetterType(type: string): string {
    switch (type) {
      case 'feasibility_study': return 'Feasibility Study';
      case 'introduction': return 'Introduction Letter';
      case 'recommendation': return 'Recommendation Letter';
      case 'postponement': return 'Postponement';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { LetterRequestService, LetterRequest } from '../../../services/letter-request.service';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  myApplications: LetterRequest[] = [];
  myApplicationsLoading = true;

  constructor(
    public sidebarService: StudentSidebarService,
    private letterRequestService: LetterRequestService
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
}

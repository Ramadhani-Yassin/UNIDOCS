import { Component, OnInit } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement, AnnouncementAttachment } from '../../../models/announcement.model';
import { SidebarService } from '../../../services/sidebar.service'; // Adjust path if needed

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  fetchDate: Date = new Date(); // Add this line

  constructor(
    private announcementService: AnnouncementService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.fetchDate = new Date(); // Set fetch date when loading starts
    this.announcementService.getRecentAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data.sort(
          (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load announcements. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  downloadAttachment(attachment: AnnouncementAttachment) {
    window.open(attachment.fileUrl, '_blank');
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
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
}
import { Component, OnInit } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement } from '../../../models/announcement.model';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.announcementService.getRecentAnnouncements().subscribe({
      next: (data) => {
        this.announcements = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load announcements. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
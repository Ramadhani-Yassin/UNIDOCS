import { Component, OnInit } from '@angular/core';
import { StudentSidebarService } from '../../../services/student-sidebar.service';

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: Date;
  author: string;
  status: 'new' | 'important' | 'update';
  attachments: {
    name: string;
    url: string;
  }[];
}

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  // Announcements state
  isLoading: boolean = true;
  errorMessage: string = '';
  announcements: Announcement[] = [];

  constructor(public sidebarService: StudentSidebarService) {}

  ngOnInit(): void {
    // Simulate API call
    setTimeout(() => {
      this.loadAnnouncements();
    }, 1000);
  }

  loadAnnouncements(): void {
    try {
      // In a real app, this would be an HTTP request
      this.announcements = [
        {
          id: 1,
          title: 'System Maintenance Scheduled',
          content: 'There will be a scheduled system maintenance on Friday, June 10th from 10:00 PM to 2:00 AM. During this time, the system may be unavailable.',
          date: new Date('2023-06-01'),
          author: 'IT Department',
          status: 'important',
          attachments: [
            { name: 'Maintenance Schedule.pdf', url: '#' }
          ]
        },
        {
          id: 2,
          title: 'New Feature Release: Dashboard Analytics',
          content: 'We are excited to announce the release of our new dashboard analytics feature. This update provides enhanced data visualization and reporting capabilities.',
          date: new Date('2023-05-28'),
          author: 'Product Team',
          status: 'update',
          attachments: [
            { name: 'Feature Documentation.pdf', url: '#' },
            { name: 'Release Notes.txt', url: '#' }
          ]
        },
        {
          id: 3,
          title: 'Welcome to Our New Platform',
          content: 'Welcome everyone to our newly launched platform. We appreciate your patience during the transition period and are excited to bring you these improvements.',
          date: new Date('2023-05-15'),
          author: 'Admin',
          status: 'new',
          attachments: []
        }
      ];
      this.isLoading = false;
    } catch (error) {
      this.errorMessage = 'Failed to load announcements. Please try again later.';
      this.isLoading = false;
      console.error(error);
    }
  }

  downloadAttachment(attachment: any) {
    console.log('Downloading:', attachment.name);
    // Actual download logic would go here
  }
}
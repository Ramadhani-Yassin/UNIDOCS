import { Component } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

interface AnnouncementForm {
  title: string;
  content: string;
  status: 'new' | 'important' | 'update';
  attachments: File[];
}

@Component({
  selector: 'app-publish-announcements',
  templateUrl: './publish-announcements.component.html',
  styleUrls: ['./publish-announcements.component.css']
})
export class PublishAnnouncementsComponent {
  form: AnnouncementForm = {
    title: '',
    content: '',
    status: 'new',
    attachments: []
  };
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(public sidebarService: SidebarService) {}

  onFileChange(event: any) {
    this.form.attachments = Array.from(event.target.files);
  }

  submitAnnouncement() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      // Reset form
      this.form = {
        title: '',
        content: '',
        status: 'new',
        attachments: []
      };
    }, 1200);
  }
}

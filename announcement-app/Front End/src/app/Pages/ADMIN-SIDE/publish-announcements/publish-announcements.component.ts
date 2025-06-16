import { Component } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';

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

  constructor(private announcementService: AnnouncementService) {}

  onFileChange(event: any) {
    this.form.attachments = Array.from(event.target.files);
  }

  submitAnnouncement() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('content', this.form.content);
    formData.append('status', this.form.status);
    this.form.attachments.forEach(file => formData.append('attachments', file));

    this.announcementService.createAnnouncement(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = error.message || 'Failed to publish announcement';
      }
    });
  }

  private resetForm() {
    this.form = {
      title: '',
      content: '',
      status: 'new',
      attachments: []
    };
  }
}
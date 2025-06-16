import { Component, EventEmitter, Output } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';
import { SidebarService } from '../../../services/sidebar.service'; // Adjust path as needed
import { Announcement } from '../../../models/announcement.model';

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

  @Output() announcementPublished = new EventEmitter<void>();

  constructor(
    private announcementService: AnnouncementService,
    public sidebarService: SidebarService // <-- add this
  ) {}

  onFileChange(event: any) {
    this.form.attachments = Array.from(event.target.files);
  }

  submitAnnouncement() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    // Build the announcement object
    const announcement = {
      title: this.form.title,
      content: this.form.content,
      status: this.form.status
      // Add attachments if needed
    };

    this.announcementService.createAnnouncementJson(announcement).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.resetForm();
        this.announcementPublished.emit();
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
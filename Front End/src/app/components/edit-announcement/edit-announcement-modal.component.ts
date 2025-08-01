import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../models/announcement.model';

@Component({
  selector: 'app-edit-announcement-modal',
  templateUrl: './edit-announcement-modal.component.html',
  styleUrls: ['./edit-announcement-modal.component.css']
})
export class EditAnnouncementModalComponent implements OnInit {
  @Input() announcementId: number | null = null;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  announcement: Announcement | null = null;
  isLoading = false;
  isSaving = false;
  error = '';

  form = {
    title: '',
    content: '',
    status: 'new'
  };

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    if (this.announcementId) {
      this.fetchAnnouncement();
    }
  }

  ngOnChanges(): void {
    if (this.announcementId) {
      this.fetchAnnouncement();
    }
  }

  fetchAnnouncement() {
    if (!this.announcementId) return;
    this.isLoading = true;
    this.announcementService.getAnnouncementById(this.announcementId.toString()).subscribe({
      next: (data) => {
        this.announcement = data;
        this.form = {
          title: data.title,
          content: data.content,
          status: data.status
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load announcement.';
        this.isLoading = false;
      }
    });
  }

  save() {
    if (!this.announcementId) return;
    this.isSaving = true;
    const updated = {
      title: this.form.title,
      content: this.form.content,
      status: this.form.status
    };
    this.announcementService.updateAnnouncement(this.announcementId, updated).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.error = 'Failed to save changes.';
        this.isSaving = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }
} 
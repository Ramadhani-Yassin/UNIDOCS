import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';
import { SidebarService } from '../../../services/sidebar.service';
import { Announcement } from '../../../models/announcement.model';

@Component({
  selector: 'app-publish-announcements',
  templateUrl: './publish-announcements.component.html',
  styleUrls: ['./publish-announcements.component.css']
})
export class PublishAnnouncementsComponent implements OnInit {
  form = {
    title: '',
    content: '',
    status: 'new',
    attachments: []
  };
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  paginatedAnnouncements: Announcement[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  editingAnnouncement: Announcement | null = null;

  @Output() announcementPublished = new EventEmitter<void>();

  constructor(
    private announcementService: AnnouncementService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.announcementService.getAllAnnouncements().subscribe(data => {
      this.announcements = data.sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      this.filterAnnouncements();
    });
  }

  filterAnnouncements(): void {
    this.filteredAnnouncements = this.announcements.filter(a => {
      const matchesSearch = !this.searchQuery ||
        a.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || a.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedAnnouncements = this.filteredAnnouncements.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAnnouncements.length / this.itemsPerPage);
  }

  startEdit(announcement: Announcement): void {
    this.editingAnnouncement = { ...announcement };
    this.form = {
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      attachments: []
    };
  }

  cancelEdit(): void {
    this.editingAnnouncement = null;
    this.resetForm();
  }

  saveEdit(): void {
    if (!this.editingAnnouncement) return;
    const updated = {
      ...this.editingAnnouncement,
      title: this.form.title,
      content: this.form.content,
      status: this.form.status
    };
    this.announcementService.createAnnouncementJson(updated).subscribe({
      next: () => {
        this.editingAnnouncement = null;
        this.resetForm();
        this.loadAnnouncements();
      },
      error: (err) => {
        this.submitError = err.message || 'Failed to update announcement';
      }
    });
  }

  deleteAnnouncement(id: number): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.deleteAnnouncement(id).subscribe(() => {
        this.loadAnnouncements();
      });
    }
  }

  submitAnnouncement() {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';
    const announcement = {
      title: this.form.title,
      content: this.form.content,
      status: this.form.status
    };
    // Instantly clear the form
    this.resetForm();
    // Backend will handle email sending asynchronously, so success appears instantly
    this.announcementService.createAnnouncementJson(announcement).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.loadAnnouncements();
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
    this.editingAnnouncement = null;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  formatDate(date: any): string {
    if (Array.isArray(date) && date.length >= 6) {
      const jsDate = new Date(
        date[0], date[1] - 1, date[2], date[3], date[4], date[5], Math.floor(date[6] / 1000000)
      );
      return jsDate.toLocaleString();
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleString();
    }
    return '-';
  }
}
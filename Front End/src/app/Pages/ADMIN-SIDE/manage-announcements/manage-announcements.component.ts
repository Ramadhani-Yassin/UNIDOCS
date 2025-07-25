import { Component, OnInit } from '@angular/core';
import { AnnouncementService } from '../../../services/announcement.service';
import { SidebarService } from '../../../services/sidebar.service';
import { Announcement } from '../../../models/announcement.model';
import { EditAnnouncementModalComponent } from '../../../components/edit-announcement-modal.component';

@Component({
  selector: 'app-manage-announcements',
  templateUrl: './manage-announcements.component.html',
  styleUrls: ['./manage-announcements.component.css']
})
export class ManageAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = [];
  paginatedAnnouncements: Announcement[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showEditModal: boolean = false;
  selectedAnnouncementId: number | null = null;

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
    this.selectedAnnouncementId = announcement.id;
    this.showEditModal = true;
  }

  onEditModalClose(): void {
    this.showEditModal = false;
    this.selectedAnnouncementId = null;
  }

  onEditModalSaved(): void {
    this.loadAnnouncements();
  }

  deleteAnnouncement(id: number): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.deleteAnnouncement(id).subscribe(() => {
        this.loadAnnouncements();
      });
    }
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

  truncate(text: string, length: number = 60): string {
    return text.length > length ? text.slice(0, length) + '...' : text;
  }
}

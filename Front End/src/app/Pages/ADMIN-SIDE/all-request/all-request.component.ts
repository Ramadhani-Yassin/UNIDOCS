import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { AdminLetterService } from '../../../services/admin-letter.service';
import { AdminSearchService } from '../../../services/admin-search.service';

@Component({
  selector: 'app-all-request',
  templateUrl: './all-request.component.html',
  styleUrls: ['./all-request.component.css']
})
export class AllRequestComponent implements OnInit {
  letterRequests: any[] = [];
  statuses = ['PENDING', 'APPROVED', 'DECLINED'];
  editingStatusIndex: number | null = null;
  isUpdating: boolean = false; // <-- Add this line
  searchTerm: string = '';
  localSearchTerm: string = '';

  constructor(
    public sidebarService: SidebarService,
    private adminLetterService: AdminLetterService,
    private adminSearchService: AdminSearchService // <-- Add this
  ) {}

  ngOnInit() {
    this.loadLetterRequests();
    this.adminSearchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.localSearchTerm = term; // Keep local input in sync with navbar
    });
  }

  loadLetterRequests() {
    this.adminLetterService.getAll().subscribe(data => {
      this.letterRequests = data;
    });
  }

  updateStatus(request: any) {
    this.isUpdating = true; // Show modal ONLY here
    const idx = this.letterRequests.findIndex(r => r.id === request.id);
    this.adminLetterService.updateStatus(request.id, request.status, request.adminComment || '').subscribe({
      next: () => {
        if (idx !== -1) {
          this.letterRequests[idx].status = request.status;
          this.letterRequests[idx].adminComment = request.adminComment;
        }
        // Add a delay (e.g., 1 second = 1000 ms)
        setTimeout(() => {
          this.isUpdating = false; // Hide modal after delay
        }, 1000);
      },
      error: () => {
        setTimeout(() => {
          this.isUpdating = false;
        }, 1000);
      }
    });
  }

  setEditingStatus(idx: number) {
    this.editingStatusIndex = idx;
  }

  saveStatus(request: any, idx: number) {
    // Do NOT show modal here, just update locally
    this.adminLetterService.updateStatus(request.id, request.status, request.adminComment || '').subscribe(() => {
      this.letterRequests[idx].status = request.status;
      this.letterRequests[idx].adminComment = request.adminComment;
      this.editingStatusIndex = null;
      // No modal here!
    });
  }

  formatDate(date: any): string {
    try {
      // If date is an array: [year, month, day, hour, minute, second, nano]
      if (Array.isArray(date) && date.length >= 6) {
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
      // Fallback for string dates
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

  onLocalSearchChange() {
    // Update the shared search term so navbar and table stay in sync
    this.adminSearchService.setSearchTerm(this.localSearchTerm);
  }

  get filteredLetterRequests() {
    if (!this.searchTerm) return this.letterRequests;
    const term = this.searchTerm.toLowerCase();
    return this.letterRequests.filter(r =>
      (r.fullName && r.fullName.toLowerCase().includes(term)) ||
      (r.letterType && r.letterType.toLowerCase().includes(term)) ||
      (r.status && r.status.toLowerCase().includes(term)) ||
      (r.adminComment && r.adminComment.toLowerCase().includes(term))
    );
  }

  openLetterInNewTab(request: any) {
    // Optionally, you can check status here if you only want to allow for APPROVED
    // if (request.status !== 'APPROVED') return;

    let firstName = 'User';
    let lastName = '';
    if (request.fullName) {
      const parts = request.fullName.trim().split(/\s+/);
      firstName = parts[0] || 'User';
      lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    }
    const fileName = `${firstName}_${lastName}_letter.pdf`;

    // Open a blank tab synchronously to avoid popup blockers
    const newTab = window.open('', '_blank');
    this.adminLetterService.getGeneratedLetter(request.id, 'pdf').subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        if (newTab) {
          newTab.location.href = url;
        } else {
          window.open(url, '_blank');
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      },
      error: () => {
        if (newTab) newTab.close();
        alert('Failed to load letter.');
      }
    });
  }
}

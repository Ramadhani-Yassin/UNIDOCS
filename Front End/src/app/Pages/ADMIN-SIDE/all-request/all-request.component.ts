import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { AdminLetterService } from '../../../services/admin-letter.service';
import { AdminSearchService } from '../../../services/admin-search.service';
import { UserService } from '../../../services/user.service'; // Import

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
  adminRole: string = '';
  letterTypeFilter: string = 'all';
  letterTypes: string[] = ['introduction', 'feasibility_study', 'recommendation']; // Add more as needed

  constructor(
    public sidebarService: SidebarService,
    private adminLetterService: AdminLetterService,
    private adminSearchService: AdminSearchService,
    private userService: UserService // Inject
  ) {}

  ngOnInit() {
    this.loadLetterRequests();
    this.adminSearchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.localSearchTerm = term;
    });
    const user = this.userService.getCurrentUser();
    this.adminRole = user?.role || '';
  }

  loadLetterRequests() {
    this.adminLetterService.getAll().subscribe(data => {
      this.letterRequests = data;

      const typesSet = new Set<string>();
      this.letterRequests.forEach(r => {
        if (!r.letterType) return;
        const type = r.letterType.trim().toLowerCase();
        if (type === 'discontinuation') return;
        if (type === 'transcript' || type === 'scholarship') {
          typesSet.add('recommendation');
        } else {
          typesSet.add(type);
        }
      });

      this.letterTypes = Array.from(typesSet);
      this.setDefaultFilterAndOrder(); // <-- Add this line
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

  filterLetterRequests() {
    // This will trigger Angular's change detection for filteredLetterRequests getter
    // If you want to do more, you can implement it here
  }

  get filteredLetterRequests() {
    let filtered = this.letterRequests;
    if (this.letterTypeFilter !== 'all') {
      filtered = filtered.filter(r => {
        const type = r.letterType?.trim().toLowerCase();
        if (type === 'transcript' || type === 'scholarship') {
          return this.letterTypeFilter === 'recommendation';
        }
        if (type === 'discontinuation') {
          return false;
        }
        return type === this.letterTypeFilter;
      });
    }
    if (!this.searchTerm) return filtered;
    const term = this.searchTerm.toLowerCase();
    return filtered.filter(r =>
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

  canApprove(letterType: string): boolean {
    const role = this.adminRole?.toLowerCase() || '';
    switch (letterType.toLowerCase()) {
      case 'introduction':
        return role === 'vc' || role === 'admin';
      case 'feasibility_study':
        return role === 'hos' || role === 'secretary' || role === 'admin';
      case 'recommendation':
        return role === 'dsc' || role === 'lecturer' || role === 'admin';
      default:
        return role === 'admin';
    }
  }

  setDefaultFilterAndOrder() {
    const role = this.adminRole?.toLowerCase();
    // Always include 'all' at the top
    let types = this.letterTypes.filter(t => t !== 'all');
    if (role === 'vc') {
      this.letterTypeFilter = 'introduction';
      this.letterTypes = ['all', 'introduction', ...types.filter(t => t !== 'introduction')];
    } else if (role === 'hos') {
      this.letterTypeFilter = 'feasibility_study';
      this.letterTypes = ['all', 'feasibility_study', ...types.filter(t => t !== 'feasibility_study')];
    } else if (role === 'dst') {
      this.letterTypeFilter = 'postpone';
      this.letterTypes = ['all', 'postpone', ...types.filter(t => t !== 'postpone')];
    } else if (role === 'lecturer' || role === 'dsc') {
      this.letterTypeFilter = 'recommendation';
      this.letterTypes = ['all', 'recommendation', ...types.filter(t => t !== 'recommendation')];
    } else if (role === 'admin') {
      this.letterTypeFilter = 'all';
      this.letterTypes = ['all', ...types];
    } else {
      this.letterTypeFilter = 'all';
      this.letterTypes = ['all', ...types];
    }
  }
}

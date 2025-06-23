import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { AdminLetterService } from '../../../services/admin-letter.service';
import { UserService } from '../../../services/user.service';
import { AdminSearchService } from '../../../services/admin-search.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-portal',
  templateUrl: './admin-portal.component.html',
  styleUrls: ['./admin-portal.component.css']
})
export class AdminPortalComponent implements OnInit {
  letterRequests: any[] = [];
  statuses = ['PENDING', 'APPROVED', 'DECLINED'];
  editingStatusIndex: number | null = null;
  isUpdating: boolean = false; // <-- Add this line
  searchTerm: string = '';
  localSearchTerm: string = '';

  totalLettersGenerated: number = 0;
  totalRegisteredStudents: number = 0;
  totalLetterTemplates: number = 8; // Set this dynamically if needed

  // Animated values
  animatedLettersGenerated: number = 0;
  animatedRegisteredStudents: number = 0;
  animatedLetterTemplates: number = 0;

  private lettersSub?: Subscription;
  private studentsSub?: Subscription;
  private templatesSub?: Subscription;

  adminRole: string = '';
  letterTypeFilter: string = 'all';
  letterTypes: string[] = ['introduction', 'feasibility_study', 'recommendation']; // Add more as needed

  constructor(
    public sidebarService: SidebarService,
    private adminLetterService: AdminLetterService,
    private userService: UserService,
    private adminSearchService: AdminSearchService,
    private cdr: ChangeDetectorRef // <-- Add this
  ) {}

  ngOnInit() {
    this.loadLetterRequests();
    this.loadCounts();
    this.animateCount('templates', this.totalLetterTemplates);
    this.adminSearchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.cdr.detectChanges();
    });
    const user = this.userService.getCurrentUser();
    this.adminRole = user?.role || '';
  }

  loadCounts() {
    this.adminLetterService.getTotalLettersGenerated().subscribe(count => {
      this.totalLettersGenerated = count;
      this.animateCount('letters', count);
    });
    this.userService.getStudentCount().subscribe(count => {
      this.totalRegisteredStudents = count;
      this.animateCount('students', count);
    });
  }

  animateCount(type: 'letters' | 'students' | 'templates', target: number) {
    const duration = 1000; // ms
    const frameRate = 30; // frames per second
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;

    if (type === 'letters' && this.lettersSub) this.lettersSub.unsubscribe();
    if (type === 'students' && this.studentsSub) this.studentsSub.unsubscribe();
    if (type === 'templates' && this.templatesSub) this.templatesSub.unsubscribe();

    const sub = interval(1000 / frameRate).subscribe(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const value = Math.floor(progress * target);

      if (type === 'letters') this.animatedLettersGenerated = value;
      if (type === 'students') this.animatedRegisteredStudents = value;
      if (type === 'templates') this.animatedLetterTemplates = value;

      if (progress === 1) {
        if (type === 'letters') this.animatedLettersGenerated = target;
        if (type === 'students') this.animatedRegisteredStudents = target;
        if (type === 'templates') this.animatedLetterTemplates = target;
        sub.unsubscribe();
      }
    });

    if (type === 'letters') this.lettersSub = sub;
    if (type === 'students') this.studentsSub = sub;
    if (type === 'templates') this.templatesSub = sub;
  }

  loadLetterRequests() {
    this.adminLetterService.getAll().subscribe(data => {
      this.letterRequests = data;

      // Collect unique types, mapping transcript/scholarship to Recommendation, and excluding discontinuation
      const typesSet = new Set<string>();
      this.letterRequests.forEach(r => {
        if (!r.letterType) return;
        const type = r.letterType.trim().toLowerCase();
        if (type === 'discontinuation') return; // Exclude
        if (type === 'transcript' || type === 'scholarship') {
          typesSet.add('recommendation');
        } else {
          typesSet.add(type);
        }
      });

      this.letterTypes = Array.from(typesSet);

      // Set default filter and order after loading types
      this.setDefaultFilterAndOrder();
    });
  }

  filterLetterRequests() {
    // This will trigger Angular's change detection for filteredLetterRequests getter
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

  updateStatus(request: any) {
    this.isUpdating = true; // Show modal
    const idx = this.letterRequests.findIndex(r => r.id === request.id);
    this.adminLetterService.updateStatus(request.id, request.status, request.adminComment || '').subscribe({
      next: () => {
        if (idx !== -1) {
          this.letterRequests[idx].status = request.status;
          this.letterRequests[idx].adminComment = request.adminComment;
        }
        setTimeout(() => {
          this.isUpdating = false; // Hide modal after delay
        }, 1000); // Adjust delay as needed
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

  openLetterInNewTab(request: any) {
    let firstName = 'User';
    let lastName = '';
    if (request.fullName) {
      const parts = request.fullName.trim().split(/\s+/);
      firstName = parts[0] || 'User';
      lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    }
    const fileName = `${firstName}_${lastName}_letter.pdf`;

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

  onLocalSearchChange() {
    // Update the shared search term so navbar and table stay in sync
    this.adminSearchService.setSearchTerm(this.localSearchTerm);
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
    if (role === 'vc') {
      this.letterTypeFilter = 'introduction';
      this.letterTypes = ['introduction', ...this.letterTypes.filter(t => t !== 'introduction')];
    } else if (role === 'hos') {
      this.letterTypeFilter = 'feasibility_study';
      this.letterTypes = ['feasibility_study', ...this.letterTypes.filter(t => t !== 'feasibility_study')];
    } else if (role === 'dst') {
      this.letterTypeFilter = 'postpone';
      this.letterTypes = ['postpone', ...this.letterTypes.filter(t => t !== 'postpone')];
    } else if (role === 'lecturer' || role === 'dsc') {
      this.letterTypeFilter = 'recommendation';
      this.letterTypes = ['recommendation', ...this.letterTypes.filter(t => t !== 'recommendation')];
    } else if (role === 'admin') {
      this.letterTypeFilter = 'all';
      // Optionally, put 'all' at the top
      this.letterTypes = ['all', ...this.letterTypes.filter(t => t !== 'all')];
    }
  }

  displayLetterType(type: string): string {
    switch (type) {
      case 'feasibility_study': return 'Feasibility Study';
      case 'introduction': return 'Introduction Letter';
      case 'recommendation': return 'Recommendation Letter';
      case 'postponement': return 'Postponement';
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
}
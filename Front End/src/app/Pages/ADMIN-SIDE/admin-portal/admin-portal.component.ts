import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { AdminLetterService } from '../../../services/admin-letter.service';
import { UserService } from '../../../services/user.service';
import { AdminSearchService } from '../../../services/admin-search.service';
import { interval, Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  // Export modal properties
  showExportModal: boolean = false;
  exportFormat: 'excel' | 'pdf' = 'excel';
  exportAllData: boolean = true;
  exportFilteredData: boolean = false;
  exportByStatus: boolean = false;
  selectedStatus: string = 'PENDING';

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

  onExportAllChange(): void {
    if (this.exportAllData) {
      this.exportFilteredData = false;
      this.exportByStatus = false;
    }
  }

  exportReport(): void {
    if (this.exportFormat === 'excel') {
      this.exportToExcel();
    } else if (this.exportFormat === 'pdf') {
      this.exportToPDF();
    }
    this.showExportModal = false;
  }

  private getDataToExport(): any[] {
    let dataToExport: any[] = [];

    if (this.exportAllData) {
      dataToExport = this.letterRequests;
    } else if (this.exportFilteredData) {
      dataToExport = this.filteredLetterRequests;
    } else if (this.exportByStatus) {
      dataToExport = this.letterRequests.filter(request => request.status === this.selectedStatus);
    }

    return dataToExport.map(request => ({
      'Student Name': request.fullName,
      'Letter Type': this.displayLetterType(request.letterType),
      'Status': request.status,
      'Admin Comment': request.adminComment || '',
      'Request Date': this.formatDate(request.requestDate)
    }));
  }

  private exportToExcel(): void {
    const dataToExport = this.getDataToExport();
    
    if (dataToExport.length === 0) {
      alert('No data to export!');
      return;
    }

    // Create worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Letter Requests': worksheet }, 
      SheetNames: ['Letter Requests'] 
    };

    // Generate buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save file
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = `letter_requests_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  }

  private exportToPDF(): void {
    const dataToExport = this.getDataToExport();
    
    if (dataToExport.length === 0) {
      alert('No data to export!');
      return;
    }

    // Create PDF content with better styling
    let pdfContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 3px solid #3C91E6;
              padding-bottom: 20px;
            }
            h1 { 
              color: #3C91E6; 
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .date { 
              color: #666; 
              font-size: 14px; 
              margin-top: 10px;
            }
            .summary {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #3C91E6;
            }
            .summary p {
              margin: 5px 0;
              font-weight: 500;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 10px 8px; 
              text-align: left; 
              vertical-align: top;
            }
            th { 
              background-color: #3C91E6; 
              color: white;
              font-weight: bold;
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f0f0f0;
            }
            .status-approved {
              color: #28a745;
              font-weight: bold;
            }
            .status-pending {
              color: #ffc107;
              font-weight: bold;
            }
            .status-declined {
              color: #dc3545;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Letter Requests Report</h1>
            <p class="date">Generated on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div class="summary">
            <p><strong>Total Records:</strong> ${dataToExport.length}</p>
            <p><strong>Export Type:</strong> ${this.exportAllData ? 'All Data' : this.exportFilteredData ? 'Filtered Data' : `Status: ${this.selectedStatus}`}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Student Name</th>
                <th style="width: 20%;">Letter Type</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 25%;">Admin Comment</th>
                <th style="width: 15%;">Request Date</th>
              </tr>
            </thead>
            <tbody>
    `;

    dataToExport.forEach(row => {
      const statusClass = row['Status'].toLowerCase().replace(' ', '-');
      pdfContent += `
        <tr>
          <td><strong>${row['Student Name']}</strong></td>
          <td>${row['Letter Type']}</td>
          <td class="status-${statusClass}">${row['Status']}</td>
          <td>${row['Admin Comment'] || '-'}</td>
          <td>${row['Request Date']}</td>
        </tr>
      `;
    });

    pdfContent += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was generated from the UNIDOCS Letter Management System</p>
            <p>© ${new Date().getFullYear()} State University of Zanzibar</p>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `letter_requests_report_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
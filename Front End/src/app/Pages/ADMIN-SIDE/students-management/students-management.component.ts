import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber?: string; // <-- Add this line
  avatar?: string;
  registrationDate?: Date | string;
  lettersRequested?: number;
  status?: 'active' | 'suspended';
  role?: string;
}

@Component({
  selector: 'app-students-management',
  templateUrl: './students-management.component.html',
  styleUrls: ['./students-management.component.css']
})
export class StudentsManagementComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  paginatedStudents: Student[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  readonly defaultAvatar: string = 'https://cdn-icons-png.freepik.com/256/535/535572.png?uid=R103879228&ga=GA1.1.1011124108.1748729365&semt=ais_hybrid';

  constructor(
    public sidebarService: SidebarService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.http.get<Student[]>(`${environment.apiUrl}/api/users/students`).subscribe(students => {
      this.students = students.map(s => ({
        ...s,
        avatar: this.defaultAvatar,
        registrationDate: s.registrationDate ? new Date(s.registrationDate) : undefined,
        lettersRequested: s.lettersRequested ?? 0,
        status: s.status ?? 'active'
      }));
      this.filterStudents();
    });
  }

  filterStudents(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchQuery ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || student.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.itemsPerPage);
  }

  suspendStudent(id: number): void {
    this.http.put(`${environment.apiUrl}/api/users/${id}/deactivate`, {}).subscribe(() => {
      const student = this.students.find(s => s.id === id);
      if (student) {
        student.status = 'suspended';
        this.filterStudents();
      }
    });
  }

  activateStudent(id: number): void {
    this.http.put(`${environment.apiUrl}/api/users/${id}/activate`, {}).subscribe(() => {
      const student = this.students.find(s => s.id === id);
      if (student) {
        student.status = 'active';
        this.filterStudents();
      }
    });
  }

  confirmDelete(id: number): void {
    if (confirm('Are you sure you want to permanently delete this student?')) {
      this.deleteStudent(id);
    }
  }

  deleteStudent(id: number): void {
    this.http.delete(`${environment.apiUrl}/api/users/${id}`).subscribe(() => {
      this.students = this.students.filter(student => student.id !== id);
      this.filterStudents();
    });
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

  openBulkImport(): void {
    console.log('Bulk import clicked');
  }

  sendWelcomeEmail(): void {
    console.log('Send welcome email clicked');
  }

  reviewSuspendedAccounts(): void {
    this.statusFilter = 'suspended';
    this.filterStudents();
  }
}

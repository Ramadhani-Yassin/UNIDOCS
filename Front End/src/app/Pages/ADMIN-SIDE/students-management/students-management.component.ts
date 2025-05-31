import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../services/sidebar.service';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  registrationDate: Date;
  lettersRequested: number;
  status: 'active' | 'suspended';
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

  constructor(public sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.students = this.generateMockStudents(75);
    this.filterStudents();
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

  suspendStudent(id: string): void {
    const student = this.students.find(s => s.id === id);
    if (student) {
      student.status = 'suspended';
      this.filterStudents();
    }
  }

  activateStudent(id: string): void {
    const student = this.students.find(s => s.id === id);
    if (student) {
      student.status = 'active';
      this.filterStudents();
    }
  }

  confirmDelete(id: string): void {
    if (confirm('Are you sure you want to permanently delete this student?')) {
      this.deleteStudent(id);
    }
  }

  deleteStudent(id: string): void {
    this.students = this.students.filter(student => student.id !== id);
    this.filterStudents();
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

  private generateMockStudents(count: number): Student[] {
    const firstNames = ['Ali', 'Fatma', 'Mohamed', 'Aisha', 'Omar', 'Khadija', 'Yusuf', 'Zainab', 'Hassan', 'Mariam'];
    const lastNames = ['Seif', 'Said', 'Juma', 'Salim', 'Hamad', 'Othman', 'Rajab', 'Kombo', 'Hemed', 'Abdallah'];

    return Array.from({ length: count }, (_, i) => ({
      id: `stu${1000 + i}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `student${1000 + i}@university.edu`,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      registrationDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)),
      lettersRequested: Math.floor(Math.random() * 50),
      status: Math.random() > 0.2 ? 'active' : 'suspended'
    }));
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  fullName: string = '';
  email: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  showIntroductionFields: boolean = false;
  showReasonField: boolean = true;
  selectedLetterType: string = '';

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const currentUser = this.userService.getCurrentUser();
    
    if (currentUser) {
      this.setUserData(currentUser);
      this.fetchUpdatedUserData(currentUser.id);
    } else {
      this.handleMissingUserData();
    }
  }

  private setUserData(user: any): void {
    console.log('User data received:', user);

    if (user.firstName && user.lastName) {
      this.fullName = `${user.firstName} ${user.lastName}`.trim();
    } else if (user.username) {
      this.fullName = user.username;
    } else if (user.name) {
      this.fullName = user.name;
    } else {
      this.fullName = 'Name not available';
    }

    this.email = user.email || 'Email not available';
    this.isLoading = false;
  }

  private fetchUpdatedUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        console.log('User data from API:', user);
        if (!user) {
          throw new Error('User data is null');
        }
        this.setUserData(user);
        this.userService.storeUserData(user);
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
        this.isLoading = false;

        const currentUser = this.userService.getCurrentUser();
        if (currentUser) {
          this.setUserData(currentUser);
        }
      }
    });
  }

  private handleMissingUserData(): void {
    this.errorMessage = 'No user session found. Please login again.';
    this.isLoading = false;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  onLetterTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLetterType = selectElement.value;
    this.showIntroductionFields = this.selectedLetterType === 'introduction';
    this.showReasonField = this.selectedLetterType !== 'introduction';
  }

  confirmLogout(event: Event): void {
    event.preventDefault();
    const confirmLogout = confirm('Do you really want to log out?');
    if (confirmLogout) {
      this.userService.logout();
      this.router.navigate(['/home']);
    }
  }
}
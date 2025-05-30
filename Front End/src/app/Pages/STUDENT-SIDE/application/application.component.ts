import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { StudentSidebarService } from '../../../services/student-sidebar.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LetterRequestService } from '../../../services/letter-request.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  @ViewChild('letterRequestForm', { static: false }) letterRequestForm!: NgForm;
  
  // User data
  fullName: string = '';
  email: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  showAlert: boolean = false;
  alertType: 'success' | 'danger' = 'success';
  
  // Letter type visibility flags
  showIntroductionFields: boolean = false;
  showFeasibilityFields: boolean = false;
  showDiscontinuationFields: boolean = false;
  showRecommendationFields: boolean = false;
  showTranscriptFields: boolean = false;
  showReasonField: boolean = false;
  
  // Form data properties with two-way binding
  selectedLetterType: string = '';
  regNumber: string = '';
  phone: string = '';
  program: string = '';
  yearOfStudy: string = '';
  reason: string = '';
  organizationName: string = '';
  startDate: string = '';
  endDate: string = '';
  researchTitle: string = '';
  feasibilityOrganization: string = '';
  studyStartDate: string = '';
  studyEndDate: string = '';
  discontinuationReason: string = '';
  effectiveDate: string = '';
  recommendationPurpose: string = '';
  receivingInstitution: string = '';
  submissionDeadline: string = '';
  transcriptPurpose: string = '';
  deliveryMethod: string = '';

  constructor(
    public sidebarService: StudentSidebarService,
    private router: Router,
    private userService: UserService,
    private letterRequestService: LetterRequestService
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
    this.fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 
                   user.username || 
                   user.name || 
                   'Name not available';
    this.email = user.email || 'Email not available';
    this.isLoading = false;
  }

  private fetchUpdatedUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: any) => {
        if (!user) throw new Error('User data is null');
        this.setUserData(user);
        this.userService.storeUserData(user);
      },
      error: (err: any) => {
        console.error('Failed to fetch user data:', err);
        this.isLoading = false;
        const currentUser = this.userService.getCurrentUser();
        if (currentUser) this.setUserData(currentUser);
      }
    });
  }

  private handleMissingUserData(): void {
    this.showAlertMessage('No user session found. Please login again.', 'danger');
    this.isLoading = false;
    setTimeout(() => this.router.navigate(['/login']), 3000);
  }

  onLetterTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLetterType = selectElement.value;
    this.resetAllFields();
    
    switch(this.selectedLetterType) {
      case 'introduction':
        this.showIntroductionFields = true;
        break;
      case 'feasibility_study':
        this.showFeasibilityFields = true;
        break;
      case 'discontinuation':
        this.showDiscontinuationFields = true;
        break;
      case 'scholarship':
        this.showRecommendationFields = true;
        break;
      case 'transcript':
        this.showTranscriptFields = true;
        break;
      case 'postponement':
        this.showReasonField = true;
        break;
      default:
        this.showReasonField = false;
    }
  }

  private resetAllFields(): void {
    this.showIntroductionFields = false;
    this.showFeasibilityFields = false;
    this.showDiscontinuationFields = false;
    this.showRecommendationFields = false;
    this.showTranscriptFields = false;
    this.showReasonField = false;
  }

  onSubmit(): void {
    if (this.letterRequestForm.invalid) {
      this.showAlertMessage('Please fill all required fields correctly.', 'danger');
      return;
    }

    const requestData = this.prepareRequestData();
    this.isLoading = true;
    this.showAlert = false;

    this.letterRequestService.submitLetterRequest(requestData).subscribe({
      next: (response: any) => {
        this.handleSuccessResponse(response);
      },
      error: (error: HttpErrorResponse) => {
        this.handleErrorResponse(error);
      }
    });
  }

  private prepareRequestData(): any {
    return {
      fullName: this.fullName,
      email: this.email,
      registrationNumber: this.regNumber,
      phoneNumber: this.phone,
      programOfStudy: this.program,
      yearOfStudy: parseInt(this.yearOfStudy),
      letterType: this.selectedLetterType,
      reasonForRequest: this.reason || this.discontinuationReason,
      effectiveDate: this.effectiveDate,
      organizationName: this.organizationName || this.feasibilityOrganization,
      startDate: this.startDate,
      endDate: this.endDate,
      researchTitle: this.researchTitle,
      recommendationPurpose: this.recommendationPurpose,
      receivingInstitution: this.receivingInstitution,
      submissionDeadline: this.submissionDeadline,
      transcriptPurpose: this.transcriptPurpose,
      deliveryMethod: this.deliveryMethod
    };
  }

  private handleSuccessResponse(response: any): void {
    this.isLoading = false;
    this.showAlertMessage(
      response.message || 'Letter request submitted successfully!', 
      'success'
    );
    this.clearForm();
  }

  private handleErrorResponse(error: HttpErrorResponse): void {
    this.isLoading = false;
    console.error('Submission error:', error);
    
    let errorMsg = 'Failed to submit request. Please try again.';
    if (error.status === 400 && error.error === 'User not found') {
      errorMsg = 'Your account is not properly registered. Please contact support.';
    } else if (error.error?.message) {
      errorMsg = error.error.message;
    }
    
    this.showAlertMessage(errorMsg, 'danger');
  }

  private showAlertMessage(message: string, type: 'success' | 'danger'): void {
    this.errorMessage = type === 'danger' ? message : '';
    this.successMessage = type === 'success' ? message : '';
    this.alertType = type;
    this.showAlert = true;
    
    if (type === 'success') {
      setTimeout(() => this.showAlert = false, 5000);
    }
  }

  clearForm(): void {
    // Reset all form fields except user data
    this.regNumber = '';
    this.phone = '';
    this.program = '';
    this.yearOfStudy = '';
    this.selectedLetterType = '';
    this.reason = '';
    this.organizationName = '';
    this.startDate = '';
    this.endDate = '';
    this.researchTitle = '';
    this.feasibilityOrganization = '';
    this.studyStartDate = '';
    this.studyEndDate = '';
    this.discontinuationReason = '';
    this.effectiveDate = '';
    this.recommendationPurpose = '';
    this.receivingInstitution = '';
    this.submissionDeadline = '';
    this.transcriptPurpose = '';
    this.deliveryMethod = '';

    // Reset form validation
    if (this.letterRequestForm) {
      this.letterRequestForm.resetForm({
        fullname: this.fullName,
        email: this.email
      });
    }
    
    this.resetAllFields();
  }

  confirmLogout(event: Event): void {
    event.preventDefault();
    if (confirm('Do you really want to log out?')) {
      this.userService.logout();
      this.router.navigate(['/home']);
    }
  }
}
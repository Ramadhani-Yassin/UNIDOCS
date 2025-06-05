import { Component } from '@angular/core';
import { CVRequestService } from '../../../services/cv-request.service';
import { StudentSidebarService } from '../../../services/student-sidebar.service'; // Import sidebar service

@Component({
  selector: 'app-cv-generator',
  templateUrl: './cv-generator.component.html',
  styleUrls: ['./cv-generator.component.css']
})
export class CVGeneratorComponent {
  fullName: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  education: string = '';
  experience: string = '';
  skills: string = '';
  about: string = '';
  selectedTemplate: string = '';
  isLoading: boolean = false;
  // Change downloadUrl to an object for docx/pdf
  downloadUrl: { docx: string, pdf: string } | null = null;

  constructor(
    private cvRequestService: CVRequestService,
    public sidebarService: StudentSidebarService // Inject sidebar service as public
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    const cvData = {
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phone, // <-- match backend field
      address: this.address,
      education: this.education,
      experience: this.experience,
      skills: this.skills,
      about: this.about,
      templateType: this.selectedTemplate // <-- match backend field
    };

    this.cvRequestService.submitCVRequest(cvData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Assume response.downloadUrl is DOCX, and PDF is similar (replace extension)
        this.downloadUrl = {
          docx: response.downloadUrl,
          pdf: response.downloadUrl.replace(/\.docx$/, '.pdf')
        };
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error generating CV:', error);
      }
    });
  }

  clearForm(): void {
    this.fullName = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.education = '';
    this.experience = '';
    this.skills = '';
    this.about = '';
    this.selectedTemplate = '';
    this.downloadUrl = null;
  }
}
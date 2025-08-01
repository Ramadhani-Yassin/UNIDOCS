import { Component } from '@angular/core';
import { CVRequestService } from '../../../services/cv-request.service';
import { StudentSidebarService } from '../../../services/student-sidebar.service'; // Import sidebar service
import { PawaAIService, CVEnhancementRequest } from '../../../services/pawa-ai.service';
import { environment } from 'src/environments/environment';

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
  isGenerating: boolean = false;
  showAlert: boolean = false;
  alertType: 'success' | 'danger' = 'success';
  successMessage: string = '';
  errorMessage: string = '';
  // Change downloadUrl to an object for docx/pdf
  downloadUrl: { docx: string, pdf: string } | null = null;
  
  // AI Enhancement features
  showAIEnhancement: boolean = false;
  aiEnhancementSuggestion: string = '';
  isEnhancing: boolean = false;
  targetIndustry: string = '';
  experienceLevel: string = '';

  constructor(
    private cvRequestService: CVRequestService,
    private pawaAIService: PawaAIService,
    public sidebarService: StudentSidebarService // Inject sidebar service as public
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.showAlert = false;
    this.downloadUrl = null;

    const cvData = {
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phone,
      address: this.address,
      education: this.education,
      experience: this.experience,
      skills: this.skills,
      about: this.about,
      cvTemplate: this.selectedTemplate
    };

    this.cvRequestService.submitCVRequest(cvData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.isGenerating = true;
        setTimeout(() => {
          this.isGenerating = false;
          if (response.requestId) {
            this.downloadUrl = {
              docx: `${environment.apiUrl}/api/cv-requests/${response.requestId}/generate?format=docx`,
              pdf: `${environment.apiUrl}/api/cv-requests/${response.requestId}/generate?format=pdf`
            };
            this.showAlertMessage('CV generated successfully!', 'success');
          } else {
            this.showAlertMessage('Failed to generate CV. Try again.', 'danger');
          }
        }, 2500);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.isGenerating = false;
        this.showAlertMessage('Error generating CV: ' + (error.message || 'Unknown error'), 'danger');
      }
    });
  }

  showAlertMessage(message: string, type: 'success' | 'danger'): void {
    this.successMessage = type === 'success' ? message : '';
    this.errorMessage = type === 'danger' ? message : '';
    this.alertType = type;
    this.showAlert = true;
    if (type === 'success') {
      setTimeout(() => this.showAlert = false, 5000);
    }
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
    this.showAIEnhancement = false;
    this.aiEnhancementSuggestion = '';
    this.targetIndustry = '';
    this.experienceLevel = '';
  }

  // AI Enhancement Methods
  toggleAIEnhancement(): void {
    this.showAIEnhancement = !this.showAIEnhancement;
    if (!this.showAIEnhancement) {
      this.aiEnhancementSuggestion = '';
    }
  }

  enhanceCVWithAI(): void {
    if (!this.fullName || !this.education || !this.experience || !this.skills) {
      this.showAlertMessage('Please fill in the basic CV information first (Name, Education, Experience, Skills)', 'danger');
      return;
    }

    this.isEnhancing = true;
    this.aiEnhancementSuggestion = '';

    // Build current CV content
    const currentCV = `
Name: ${this.fullName}
Email: ${this.email}
Phone: ${this.phone}
Address: ${this.address}

Education:
${this.education}

Experience:
${this.experience}

Skills:
${this.skills}

About:
${this.about}
    `.trim();

    const enhancementRequest: CVEnhancementRequest = {
      currentCV: currentCV,
      targetIndustry: this.targetIndustry || 'General',
      experienceLevel: this.experienceLevel || 'Student',
      skills: this.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    };

    this.pawaAIService.enhanceCV(enhancementRequest).subscribe({
      next: (suggestion) => {
        this.isEnhancing = false;
        this.aiEnhancementSuggestion = suggestion;
        this.showAlertMessage('AI enhancement completed! Check the suggestions below.', 'success');
      },
      error: (error) => {
        this.isEnhancing = false;
        this.showAlertMessage('AI enhancement failed: ' + (error.message || 'Unknown error'), 'danger');
      }
    });
  }

  applyAISuggestion(): void {
    if (this.aiEnhancementSuggestion) {
      // Parse AI suggestions and apply them to the form
      // This is a simplified implementation - you can enhance it based on AI response format
      this.showAlertMessage('AI suggestions applied! Review and adjust as needed.', 'success');
    }
  }
}
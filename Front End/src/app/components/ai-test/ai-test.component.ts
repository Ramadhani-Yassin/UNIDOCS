import { Component, OnInit } from '@angular/core';
import { PawaAIService } from '../../services/pawa-ai.service';

@Component({
  selector: 'app-ai-test',
  template: `
    <div class="ai-test-container">
      <h2>Pawa AI Integration Test</h2>
      
      <div class="test-section">
        <h3>Service Health Check</h3>
        <button (click)="testHealth()" [disabled]="isLoading">Test Connection</button>
        <div *ngIf="healthStatus" class="status">
          Status: <span [class]="healthStatus ? 'success' : 'error'">
            {{ healthStatus ? 'Connected' : 'Failed' }}
          </span>
        </div>
      </div>

      <div class="test-section">
        <h3>Chat Test</h3>
        <input [(ngModel)]="testMessage" placeholder="Enter test message" />
        <button (click)="testChat()" [disabled]="isLoading">Send Test Message</button>
        <div *ngIf="chatResponse" class="response">
          <strong>AI Response:</strong>
          <p>{{ chatResponse }}</p>
        </div>
      </div>

      <div class="test-section">
        <h3>CV Enhancement Test</h3>
        <textarea [(ngModel)]="testCV" placeholder="Enter test CV content"></textarea>
        <button (click)="testCVEnhancement()" [disabled]="isLoading">Test CV Enhancement</button>
        <div *ngIf="cvEnhancementResponse" class="response">
          <strong>Enhancement Suggestions:</strong>
          <p>{{ cvEnhancementResponse }}</p>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading">
        <p>Testing AI service...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>Error: {{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .ai-test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    input, textarea {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    textarea {
      height: 100px;
      resize: vertical;
    }
    
    button {
      background: #fc763f;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .status, .response {
      margin-top: 10px;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    
    .success { color: green; }
    .error { color: red; }
    
    .loading {
      text-align: center;
      color: #fc763f;
    }
  `]
})
export class AiTestComponent implements OnInit {
  isLoading = false;
  error = '';
  healthStatus: boolean | null = null;
  chatResponse = '';
  cvEnhancementResponse = '';
  
  testMessage = 'Hello, can you help me with university procedures?';
  testCV = `John Doe
Email: john@example.com
Phone: +255123456789

Education:
Bachelor of Computer Science, SUZA, 2020-2024

Experience:
Student Assistant, SUZA Library, 2022-2024

Skills:
JavaScript, Angular, Java, Spring Boot`;

  constructor(private pawaAIService: PawaAIService) {}

  ngOnInit(): void {
    // Auto-test health on component load
    this.testHealth();
  }

  testHealth(): void {
    this.isLoading = true;
    this.error = '';
    
    this.pawaAIService.checkServiceHealth().subscribe({
      next: (isHealthy) => {
        this.healthStatus = isHealthy;
        this.isLoading = false;
      },
      error: (err) => {
        this.healthStatus = false;
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  testChat(): void {
    if (!this.testMessage.trim()) {
      this.error = 'Please enter a test message';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.chatResponse = '';
    
    this.pawaAIService.chatWithAI(this.testMessage).subscribe({
      next: (response) => {
        this.chatResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  testCVEnhancement(): void {
    if (!this.testCV.trim()) {
      this.error = 'Please enter test CV content';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.cvEnhancementResponse = '';
    
    const enhancementRequest = {
      currentCV: this.testCV,
      targetIndustry: 'Technology',
      experienceLevel: 'Student',
      skills: ['JavaScript', 'Angular', 'Java', 'Spring Boot']
    };
    
    this.pawaAIService.enhanceCV(enhancementRequest).subscribe({
      next: (response) => {
        this.cvEnhancementResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }
} 
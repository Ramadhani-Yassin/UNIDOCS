import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MockPawaAIService } from './mock-pawa-ai.service';

export interface PawaAIRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface PawaAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CVEnhancementRequest {
  currentCV: string;
  jobDescription?: string;
  targetIndustry?: string;
  experienceLevel?: string;
  skills?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
  isTranslating?: boolean;
  isTranslated?: boolean;
}

export interface AnnouncementGenerationRequest {
  keyPoints: string[];
  targetAudience: string;
  urgency: 'low' | 'medium' | 'high';
  language: 'en' | 'sw';
}

@Injectable({
  providedIn: 'root'
})
export class PawaAIService {
  private readonly PAWA_AI_BASE_URL = environment.pawaAI.baseUrl;
  private readonly API_KEY = environment.pawaAI.apiKey;
  
  private chatHistory = new BehaviorSubject<ChatMessage[]>([]);
  public chatHistory$ = this.chatHistory.asObservable();

  constructor(
    private http: HttpClient,
    private mockService: MockPawaAIService
  ) {}

  // Core Pawa AI API call
  private callPawaAI(request: PawaAIRequest): Observable<PawaAIResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.API_KEY}`
    });

    // Try different endpoint structures
    const endpoints = [
      `${this.PAWA_AI_BASE_URL}/chat/completions`,
      `${this.PAWA_AI_BASE_URL}/completions`,
      `${this.PAWA_AI_BASE_URL}/chat`,
      `${this.PAWA_AI_BASE_URL}/api/chat`
    ];

    // Use the first endpoint for now, we'll handle fallbacks in error handling
    return this.http.post<PawaAIResponse>(endpoints[0], request, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // CV Enhancement Feature
  enhanceCV(request: CVEnhancementRequest): Observable<string> {
    // Use mock service for now while we resolve API issues
    return this.mockService.enhanceCV(request);
  }

  // Smart Chat Assistant
  chatWithAI(message: string, context?: string): Observable<string> {
    // Use mock service for now while we resolve API issues
    return this.mockService.chatWithAI(message, context).pipe(
      tap(response => {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          context
        };
        this.addToChatHistory(assistantMessage);
      })
    );
  }

  // Smart Announcement Generation
  generateAnnouncement(request: AnnouncementGenerationRequest): Observable<string> {
    // Use mock service for now while we resolve API issues
    return this.mockService.generateAnnouncement(request);
  }

  // Smart Search and Analytics
  analyzeStudentData(query: string): Observable<string> {
    // Use mock service for now while we resolve API issues
    return this.mockService.analyzeStudentData(query);
  }

  // Document Processing
  processDocument(documentContent: string, documentType: string): Observable<string> {
    // Use mock service for now while we resolve API issues
    return this.mockService.processDocument(documentContent, documentType);
  }

  // Helper Methods
  private buildCVEnhancementPrompt(request: CVEnhancementRequest): string {
    return `
    Please enhance this CV for better effectiveness:
    
    Current CV:
    ${request.currentCV}
    
    Target Industry: ${request.targetIndustry || 'General'}
    Experience Level: ${request.experienceLevel || 'Student'}
    Key Skills: ${request.skills?.join(', ') || 'Not specified'}
    Job Description: ${request.jobDescription || 'Not provided'}
    
    Please provide:
    1. Specific improvements and suggestions
    2. Better wording and phrasing
    3. Skills and achievements to highlight
    4. Format and structure recommendations
    5. ATS optimization tips
    
    Make the response practical and actionable.
    `;
  }

  private buildAnnouncementPrompt(request: AnnouncementGenerationRequest): string {
    const urgencyText = {
      low: 'standard',
      medium: 'important',
      high: 'urgent'
    };

    return `
    Create a ${urgencyText[request.urgency]} announcement for ${request.targetAudience}:
    
    Key Points:
    ${request.keyPoints.map(point => `- ${point}`).join('\n')}
    
    Requirements:
    - Language: ${request.language === 'sw' ? 'Swahili' : 'English'}
    - Tone: Professional but accessible
    - Include relevant contact information
    - Make it engaging and clear
    - Format for easy reading
    
    Generate a complete announcement ready for publication.
    `;
  }

  public addToChatHistory(message: ChatMessage): void {
    const currentHistory = this.chatHistory.value;
    this.chatHistory.next([...currentHistory, message]);
  }

  public addUserMessage(content: string, context?: string): void {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      context
    };
    this.addToChatHistory(userMessage);
  }

  public clearChatHistory(): void {
    this.chatHistory.next([]);
  }

  public getChatHistory(): ChatMessage[] {
    return this.chatHistory.value;
  }

  // Translate content to English
  translateToEnglish(content: string): Observable<string> {
    return this.mockService.translateToEnglish(content).pipe(
      tap(response => {
        console.log('Translation successful:', response);
      }),
      catchError(error => {
        console.error('Translation error:', error);
        return throwError(() => new Error('Translation failed'));
      })
    );
  }

  // Error Handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred with Pawa AI service';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Pawa AI Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Health Check
  public checkServiceHealth(): Observable<boolean> {
    // Use mock service for now while we resolve API issues
    return this.mockService.checkServiceHealth();
  }
} 
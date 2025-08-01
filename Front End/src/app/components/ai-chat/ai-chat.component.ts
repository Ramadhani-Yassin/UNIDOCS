import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PawaAIService, ChatMessage } from '../../services/pawa-ai.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  
  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  isLoading = false;
  isChatOpen = false;
  private subscription = new Subscription();

  // Quick action buttons for common queries
  quickActions = [
    { text: 'How to apply for a letter?', icon: '📝' },
    { text: 'What are the exam dates?', icon: '📅' },
    { text: 'How to reset my password?', icon: '🔐' },
    { text: 'Where is the library?', icon: '📚' },
    { text: 'How to contact my lecturer?', icon: '👨‍🏫' },
    { text: 'What are the graduation requirements?', icon: '🎓' }
  ];

  constructor(
    private fb: FormBuilder,
    private pawaAIService: PawaAIService
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Load chat history
    this.messages = this.pawaAIService.getChatHistory();
    
    // Subscribe to chat history updates
    this.subscription.add(
      this.pawaAIService.chatHistory$.subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      })
    );

    // Add welcome message if no history
    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    if (this.chatForm.valid && !this.isLoading) {
      const message = this.chatForm.get('message')?.value.trim();
      if (message) {
        this.isLoading = true;
        
        // Add user message to chat
        this.pawaAIService.addUserMessage(message);
        
        // Send to Pawa AI
        this.subscription.add(
          this.pawaAIService.chatWithAI(message).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.chatForm.reset();
              this.scrollToBottom();
            },
            error: (error) => {
              console.error('Chat error:', error);
              this.isLoading = false;
              // Add error message to chat
              const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
                timestamp: new Date()
              };
              this.pawaAIService.addToChatHistory(errorMessage);
            }
          })
        );
      }
    }
  }

  sendQuickAction(action: string): void {
    this.chatForm.patchValue({ message: action });
    this.sendMessage();
  }

  clearChat(): void {
    this.pawaAIService.clearChatHistory();
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `👋 Hello! I'm your UNIDOCS AI Assistant. I can help you with:

• Academic queries and procedures
• University information and policies
• Letter request guidance
• General student support

How can I assist you today?`,
      timestamp: new Date()
    };
    this.pawaAIService.addToChatHistory(welcomeMessage);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  // Handle Enter key press
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Format timestamp
  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check if message is from user
  isUserMessage(message: ChatMessage): boolean {
    return message.role === 'user';
  }

  // Get message class for styling
  getMessageClass(message: ChatMessage): string {
    return message.role === 'user' ? 'user-message' : 'assistant-message';
  }

  // Translate message to English
  translateToEnglish(message: ChatMessage): void {
    if (message.isTranslating || message.isTranslated) {
      return;
    }

    // Mark message as translating
    message.isTranslating = true;

    // Get English translation from mock service
    this.subscription.add(
      this.pawaAIService.translateToEnglish(message.content).subscribe({
        next: (translatedContent) => {
          message.content = translatedContent;
          message.isTranslated = true;
          message.isTranslating = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Translation error:', error);
          message.isTranslating = false;
          // Show error message
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, translation failed. Please try again.',
            timestamp: new Date()
          };
          this.pawaAIService.addToChatHistory(errorMessage);
        }
      })
    );
  }
} 
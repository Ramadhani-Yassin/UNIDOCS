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
  // Add reference to the widget container for dragging
  @ViewChild('chatWidget', { static: false }) chatWidgetRef!: ElementRef<HTMLElement>;
  
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

  // Draggable widget state
  widgetStyle: { [key: string]: string } = { bottom: '20px', right: '20px' };
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startLeft = 0;
  private fixedBottom = 20; // in px, captured at drag start
  private dragMoved = false;

  // Bound handlers to be able to remove listeners
  private onDragMoveHandler = (event: MouseEvent | TouchEvent) => this.onDragMove(event);
  private onDragEndHandler = () => this.endDrag();

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
    // Clean up any dangling listeners
    this.detachDragListeners();
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      // Ensure the chat box is fully visible after it renders
      setTimeout(() => {
        this.ensureChatWithinViewport();
        this.scrollToBottom();
      }, 0);
    }
  }

  // Guard toggle to avoid triggering click when dragging
  onToggleClick(event: MouseEvent): void {
    if (this.dragMoved) {
      event.preventDefault();
      event.stopPropagation();
      // Reset flag after preventing the click
      this.dragMoved = false;
      return;
    }
    this.toggleChat();
  }

  // Drag handlers
  startDrag(event: MouseEvent | TouchEvent): void {
    const widget = this.chatWidgetRef?.nativeElement;
    if (!widget) return;

    const { clientX, clientY, isTouch } = this.getClientPoint(event);

    const rect = widget.getBoundingClientRect();
    this.startLeft = rect.left;
    this.fixedBottom = Math.max(0, Math.round(window.innerHeight - rect.bottom));
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.isDragging = true;
    this.dragMoved = false;

    // Switch to bottom/left anchoring during drag to ensure panel opens above icon
    this.widgetStyle = {
      bottom: `${this.fixedBottom}px`,
      left: `${this.startLeft}px`,
      right: 'auto',
      top: 'auto'
    };

    // Attach listeners
    window.addEventListener('mousemove', this.onDragMoveHandler, { passive: false });
    window.addEventListener('mouseup', this.onDragEndHandler, { passive: true });
    window.addEventListener('touchmove', this.onDragMoveHandler as EventListener, { passive: false });
    window.addEventListener('touchend', this.onDragEndHandler, { passive: true });

    if (isTouch) {
      // Prevent accidental scroll while dragging on touch
      try { (event as TouchEvent).preventDefault(); } catch {}
    }
  }

  private onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const widget = this.chatWidgetRef?.nativeElement;
    if (!widget) return;

    const { clientX } = this.getClientPoint(event);

    const dx = clientX - this.dragStartX;

    const tentativeLeft = this.startLeft + dx;

    const viewportWidth = window.innerWidth;
    const rect = widget.getBoundingClientRect();
    // Clamp only by current widget width (do not reserve chat width)
    const clampedLeft = Math.max(0, Math.min(tentativeLeft, viewportWidth - rect.width));

    this.widgetStyle = {
      bottom: `${this.fixedBottom}px`,
      left: `${clampedLeft}px`,
      right: 'auto',
      top: 'auto'
    };

    if (Math.abs(dx) > 3) {
      this.dragMoved = true;
    }

    // Prevent scrolling when dragging (mobile)
    try { (event as TouchEvent).preventDefault(); } catch {}
  }

  private endDrag(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.detachDragListeners();
    // If open, make a final adjustment to keep the full chat visible
    if (this.isChatOpen) {
      setTimeout(() => this.ensureChatWithinViewport(), 0);
    }
  }

  private detachDragListeners(): void {
    window.removeEventListener('mousemove', this.onDragMoveHandler as EventListener);
    window.removeEventListener('mouseup', this.onDragEndHandler as EventListener);
    window.removeEventListener('touchmove', this.onDragMoveHandler as EventListener);
    window.removeEventListener('touchend', this.onDragEndHandler as EventListener);
  }

  private ensureChatWithinViewport(): void {
    const widget = this.chatWidgetRef?.nativeElement;
    if (!widget) return;
    const rect = widget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    let currentLeft = 0;
    if (this.widgetStyle['left'] && this.widgetStyle['left'].endsWith('px')) {
      currentLeft = parseFloat(this.widgetStyle['left']);
    } else {
      currentLeft = rect.left;
    }

    const overflowRight = rect.right - viewportWidth;
    if (overflowRight > 0) {
      currentLeft = Math.max(0, currentLeft - overflowRight);
    }
    if (rect.left < 0) {
      currentLeft = 0;
    }

    this.widgetStyle = {
      bottom: `${this.fixedBottom}px`,
      left: `${currentLeft}px`,
      right: 'auto',
      top: 'auto'
    };
  }

  private getClientPoint(event: MouseEvent | TouchEvent): { clientX: number; clientY: number; isTouch: boolean } {
    if ((event as TouchEvent).touches && (event as TouchEvent).touches.length) {
      const t = (event as TouchEvent).touches[0];
      return { clientX: t.clientX, clientY: t.clientY, isTouch: true };
    }
    const e = event as MouseEvent;
    return { clientX: e.clientX, clientY: e.clientY, isTouch: false };
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
            next: () => {
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
import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AiChatService, AiChatMessageDto } from '../../core/services/aiChatService';

interface AiMessage {
  id: number;
  role: string;
  content: string;
  sentAt: Date;
  dateStr: string;
  timeStr: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css'
})
export class AiChat implements OnInit, AfterViewChecked {
  private aiChatService = inject(AiChatService);
  private translate = inject(TranslateService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  currentText = '';
  messages = signal<AiMessage[]>([]);
  isLoading = signal<boolean>(false);
  isThinking = signal<boolean>(false);

  ngOnInit(): void {
    this.loadHistory();
  }

  private loadHistory() {
    this.isLoading.set(true);

    this.aiChatService.getHistory().subscribe({
      next: (history) => {
        const lang = this.translate.currentLang || 'en-US';
        const mapped: AiMessage[] = history.map(m => this.mapMessage(m, lang));
        this.messages.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('AI sohbet geçmişi yüklenemedi:', err);
        this.isLoading.set(false);
      }
    });
  }

  async onSend() {
    const text = this.currentText.trim();
    if (!text || this.isThinking()) return;

    const lang = this.translate.currentLang || 'en-US';

    // Kullanıcı mesajını anında UI'a ekle (optimistic update)
    const userMsg: AiMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      sentAt: new Date(),
      dateStr: new Date().toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }) + ',',
      timeStr: new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.update(prev => [...prev, userMsg]);
    this.currentText = '';

    // AI'dan yanıt al
    this.isThinking.set(true);

    this.aiChatService.sendMessage(text).subscribe({
      next: (response) => {
        const aiMsg = this.mapMessage(response, lang);
        this.messages.update(prev => [...prev, aiMsg]);
        this.isThinking.set(false);
      },
      error: (err) => {
        console.error('AI yanıtı alınamadı:', err);
        // Hata mesajı ekle
        const errorMsg: AiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: this.translate.instant('AI_CHAT.ERROR_RESPONSE'),
          sentAt: new Date(),
          dateStr: new Date().toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }) + ',',
          timeStr: new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
        };
        this.messages.update(prev => [...prev, errorMsg]);
        this.isThinking.set(false);
      }
    });
  }

  onClearHistory() {
    this.aiChatService.clearHistory().subscribe({
      next: () => {
        this.messages.set([]);
      },
      error: (err) => console.error('Geçmiş temizlenemedi:', err)
    });
  }

  private mapMessage(m: AiChatMessageDto, lang: string): AiMessage {
    const date = new Date(m.sentAt);
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      sentAt: date,
      dateStr: date.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }) + ',',
      timeStr: date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Markdown-like basit formatlama: **bold**, `code`, satır sonu
   */
  formatContent(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}

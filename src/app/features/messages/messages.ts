import { Component, inject, signal, computed, effect, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { SignalrService, ChatMessage } from '../../core/services/signalr';
import { AuthService } from '../../core/services/authService';
import { UserService } from '../../core/services/userService';
import { MessageService } from '../../core/services/messageService';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit, AfterViewChecked {
  private signalR = inject(SignalrService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  selectedUserId = signal<string | null>(null);
  currentText = '';
  users = signal<any[]>([]);
  isLoadingHistory = signal<boolean>(false);

  // DB'den yüklenen geçmiş mesajlar
  private historyMessages = signal<ChatMessage[]>([]);

  // Yeni mesaj gelen kullanıcıyı parlatmak için
  highlightedUserId = signal<string | null>(null);
  private lastMessageCount = 0;

  constructor() {
    // SignalR mesajlarını izle — yeni mesaj gelince sidebar'ı güncelle
    effect(() => {
      const allMessages = this.signalR.messages();
      if (allMessages.length > this.lastMessageCount && allMessages.length > 0) {
        const latest = allMessages[allMessages.length - 1];
        const myId = this.auth.getCurrentUserId()?.toString();

        // Mesajın ait olduğu karşı tarafın ID'sini bul
        const otherUserId = latest.senderId === myId ? latest.receiverId : latest.senderId;

        // Kullanıcıyı listenin en üstüne taşı
        this.moveUserToTop(otherUserId);

        // Kullanıcının lastMessage ve time'ını güncelle
        this.updateUserPreview(otherUserId, latest.content, latest.timestamp);

        // Eğer mesaj bana geldiyse ve o conversation açık değilse, unread yap
        if (latest.senderId !== myId && this.selectedUserId() !== otherUserId) {
          this.setUserUnread(otherUserId, true);
          this.messageService.hasGlobalUnread.set(true);
        }

        // Parlatma efekti tetikle
        this.highlightedUserId.set(otherUserId);
        setTimeout(() => this.highlightedUserId.set(null), 1500);
      }
      this.lastMessageCount = allMessages.length;
    });
  }

  ngOnInit(): void {
    // Gerçek kullanıcıları Backend'den yükle
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        const myId = this.auth.getCurrentUserId()?.toString();
        
        const mappedUsers = res
          .filter(u => u.id.toString() !== myId)
          .map(u => ({
            id: u.id.toString(),
            name: u.username || u.email,
            lastMessage: '',
            dateInfo: '',
            timeInfo: '',
            timestamp: null,
            hasUnread: false
          }));
          
        this.users.set(mappedUsers);

        // Kullanıcılar yüklendikten sonra son mesajları çek
        this.loadRecentConversations();
      },
      error: (err) => console.error('Kullanıcılar yüklenemedi:', err)
    });
  }

  private loadRecentConversations() {
    const myId = this.auth.getCurrentUserId()?.toString();

    this.messageService.getRecentConversations().subscribe({
      next: (recent) => {
        const currentUsers = [...this.users()];

        for (const msg of recent) {
          // Bu mesajdaki konuşma partneri kim?
          const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
          const userIdx = currentUsers.findIndex(u => u.id === partnerId);

          if (userIdx >= 0) {
            const lang = this.translate.currentLang || 'en-US';
            currentUsers[userIdx] = {
              ...currentUsers[userIdx],
              lastMessage: msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content,
              dateInfo: new Date(msg.sentAt).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }),
              timeInfo: new Date(msg.sentAt).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(msg.sentAt).getTime(),
              // Eğer mesaj bana gelmiş ve okunmamışsa unread göster
              hasUnread: msg.senderId !== myId && !msg.isRead
            };
          }
        }

        // Mesajı olan kullanıcıları üste taşı
        currentUsers.sort((a, b) => {
          if (a.timestamp && !b.timestamp) return -1;
          if (!a.timestamp && b.timestamp) return 1;
          if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
          return 0;
        });

        this.users.set(currentUsers);
      },
      error: (err) => console.error('Son mesajlar yüklenemedi:', err)
    });
  }

  chatMessages = computed(() => {
    const selectedId = this.selectedUserId();
    if (!selectedId) return [];

    const history = this.historyMessages();
    const realtime = this.signalR.messages().filter(m =>
      m.senderId === selectedId || m.receiverId === selectedId
    );

    const historyIds = new Set(history.map(m => m.id));
    const uniqueRealtime = realtime.filter(m => !m.id || !historyIds.has(m.id));

    const combined = [...history, ...uniqueRealtime];
    const lang = this.translate.currentLang || 'en-US';

    return combined.map(m => ({
      ...m,
      dateStr: m.timestamp.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }) + ',',
      timeStr: m.timestamp.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    }));
  });

  selectedUserName = computed(() => {
    return this.users().find(u => u.id === this.selectedUserId())?.name || '';
  });

  selectUser(userId: string) {
    this.selectedUserId.set(userId);
    this.historyMessages.set([]);

    // Okunmamış durumunu temizle (backend zaten mark-as-read yapıyor)
    this.setUserUnread(userId, false);
    
    // Kalan okunmamış var mı kontrol et, varsa global badge açık kalsın, yoksa sönsün
    const anyUnreadLeft = this.users().some(u => u.hasUnread);
    this.messageService.hasGlobalUnread.set(anyUnreadLeft);

    this.loadHistory(userId);
  }

  private loadHistory(userId: string) {
    this.isLoadingHistory.set(true);

    this.messageService.getConversation(userId).subscribe({
      next: (messages) => {
        const mapped: ChatMessage[] = messages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          content: m.content,
          timestamp: new Date(m.sentAt)
        }));

        this.historyMessages.set(mapped);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Mesaj geçmişi yüklenemedi:', err);
        this.isLoadingHistory.set(false);
      }
    });
  }

  private moveUserToTop(userId: string) {
    const currentUsers = this.users();
    const idx = currentUsers.findIndex(u => u.id === userId);
    if (idx > 0) {
      const updated = [...currentUsers];
      const [user] = updated.splice(idx, 1);
      updated.unshift(user);
      this.users.set(updated);
    }
  }

  private updateUserPreview(userId: string, content: string, timestamp: Date) {
    const currentUsers = this.users();
    const lang = this.translate.currentLang || 'en-US';
    const updated = currentUsers.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          lastMessage: content.length > 30 ? content.substring(0, 30) + '...' : content,
          dateInfo: timestamp.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' }),
          timeInfo: timestamp.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }),
          timestamp: timestamp.getTime()
        };
      }
      return u;
    });
    this.users.set(updated);
  }

  private setUserUnread(userId: string, hasUnread: boolean) {
    const currentUsers = this.users();
    const updated = currentUsers.map(u => {
      if (u.id === userId) {
        return { ...u, hasUnread };
      }
      return u;
    });
    this.users.set(updated);
  }

  async onSend() {
    const text = this.currentText.trim();
    const targetId = this.selectedUserId();

    if (text && targetId) {
      try {
        await this.signalR.sendMessage(targetId, text);
        this.currentText = '';
      } catch (err) {
        console.error('Mesaj gönderilirken hata oluştu:', err);
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  isMe(senderId: string): boolean {
    const myId = this.auth.getCurrentUserId()?.toString();
    return senderId === myId;
  }
}
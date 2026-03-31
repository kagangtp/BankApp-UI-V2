import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SignalrService } from '../../core/services/signalr';
import { AuthService } from '../../core/services/authService';
import { UserService } from '../../core/services/userService';

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

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  selectedUserId = signal<string | null>(null);
  currentText = '';
  users = signal<any[]>([]);

  ngOnInit(): void {
    // Gerçek kullanıcıları Backend'den yükle
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        const myId = this.auth.getCurrentUserId()?.toString();
        
        // Kendimizi listeden çıkartalım ve chat arayüzüne map'leyelim
        const mappedUsers = res
          .filter(u => u.id.toString() !== myId)
          .map(u => ({
            id: u.id.toString(),
            name: u.username || u.email,
            lastMessage: 'Sohbete başlamak için tıkla...',
            time: ''
          }));
          
        this.users.set(mappedUsers);
      },
      error: (err) => console.error('Kullanıcılar yüklenemedi:', err)
    });
  }

  chatMessages = computed(() => {
    const selectedId = this.selectedUserId();
    if (!selectedId) return [];

    // Sohbet geçmişinde gönderilen ve alınanları o kişiye göre filtrele
    return this.signalR.messages().filter(m =>
      m.senderId === selectedId || m.receiverId === selectedId
    );
  });

  selectedUserName = computed(() => {
    return this.users().find(u => u.id === this.selectedUserId())?.name || '';
  });

  selectUser(userId: string) {
    this.selectedUserId.set(userId);
  }

  async onSend() {
    const text = this.currentText.trim();
    const targetId = this.selectedUserId();

    if (text && targetId) {
      try {
        await this.signalR.sendMessage(targetId, text);
        this.currentText = ''; // Temizle
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
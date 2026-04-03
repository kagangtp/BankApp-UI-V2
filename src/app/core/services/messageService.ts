import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessageDto {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/Chat';

  /**
   * Oturum açmış kullanıcı ile belirtilen kullanıcı arasındaki mesaj geçmişini getirir.
   */
  getConversation(otherUserId: string): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.apiUrl}/conversation/${otherUserId}`);
  }

  /**
   * Global olarak okunmamış mesaj durumunu tutan signal
   */
  hasGlobalUnread = signal<boolean>(false);

  /**
   * Sidebar için: her konuşma partnerinden son mesajı getirir.
   */
  getRecentConversations(): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.apiUrl}/recent`);
  }

  /**
   * Global bildirim için okunmamış mesaj var mı kontrolü
   */
  getHasUnread(): Observable<{ hasUnread: boolean }> {
    return this.http.get<{ hasUnread: boolean }>(`${this.apiUrl}/has-unread`);
  }
}

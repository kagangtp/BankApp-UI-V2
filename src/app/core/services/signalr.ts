import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

// Mesaj yapısını netleştirelim
export interface ChatMessage {
  id: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  // UI'ın dinleyeceği Signals
  public notification = signal<any>(null);
  public messages = signal<ChatMessage[]>([]); // Tüm mesaj trafiği burada birikir
  public unreadCount = signal<number>(0); // Sidebar için bonus

  constructor() { }

  public initHub() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected ||
      this.hubConnection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      // Not: Eğer backend'de Chat için ayrı bir hub açtıysan '/chat-hub' yapmalısın
      .withUrl(`${environment.rootUrl}/notification-hub`, {
        accessTokenFactory: () => localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR: Chat & Notification bağlantısı kuruldu!'))
      .catch(err => console.error('❌ SignalR Bağlantı Hatası:', err));

    // --- Dinleyiciler (Listeners) ---

    // 1. Bildirim Dinleyicisi
    this.hubConnection.on('ReceiveNotification', (data) => {
      this.notification.set(data);
    });

    // 2. Chat Mesaj Dinleyicisi (artık id parametresi de alıyor)
    this.hubConnection.on('ReceiveMessage', (senderId: string, receiverId: string, content: string, timestamp: string, id: number) => {
      const newMessage: ChatMessage = {
        id,
        senderId,
        receiverId,
        content,
        timestamp: new Date(timestamp)
      };

      // Duplicate kontrolü: Aynı id'ye sahip mesaj zaten varsa ekleme
      this.messages.update(prev => {
        if (id && prev.some(m => m.id === id)) return prev;
        return [...prev, newMessage];
      });

      this.unreadCount.update(count => count + 1);
    });
  }

  /**
   * Backend'deki 'SendMessageToUser' metodunu tetikler
   */
  public async sendMessage(receiverId: string, message: string) {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR bağlantısı henüz hazır değil!');
    }

    // Backend'deki Hub içindeki metod ismini birebir yazmalısın: 'SendMessageToUser'
    await this.hubConnection.invoke('SendMessageToUser', receiverId, message);
  }

  public stopHub() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('🚫 SignalR: Bağlantı kapatıldı.');
          this.notification.set(null);
          this.messages.set([]); // Çıkışta mesajları temizle
        })
        .catch(err => console.error('SignalR Stop Error:', err));
    }
  }
}
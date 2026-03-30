import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  // Bildirimleri tutacak Signal (UI burayı dinleyecek)
  public notification = signal<any>(null);

  constructor() { }

  public initHub() {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected ||
      this.hubConnection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.rootUrl}/notification-hub`, {
        // Backend [Authorize] bekliyorsa token'ı buradan ekliyoruz
        accessTokenFactory: () => localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      })
      .withAutomaticReconnect() // İnternet koparsa otomatik tekrar bağlanır
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR: Yetkili bağlantı kuruldu!'))
      .catch(err => console.error('❌ SignalR Bağlantı Hatası:', err));

    // Dinleyiciyi kur
    this.hubConnection.on('ReceiveNotification', (data) => {
      console.log('🔔 Yeni Bildirim:', data);
      this.notification.set(data);
    });
  }

  /**
   * Hub bağlantısını keser.
   * Bu metodu LOGOUT yaptığında çağırmalısın.
   */
  public stopHub() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('🚫 SignalR: Bağlantı güvenli şekilde kapatıldı.');
          this.notification.set(null); // Eski bildirimleri temizle
        })
        .catch(err => console.error('SignalR Stop Error:', err));
    }
  }
}
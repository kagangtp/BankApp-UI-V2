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

  constructor() {
    this.startConnection();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('${environment.apiUrl}/notification-hub') // .NET Portuna dikkat!
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR bağlantısı başarılı!'))
      .catch(err => console.error('Error:', err));

    // Backend'deki "ReceiveNotification" metodunu dinle
    this.hubConnection.on('ReceiveNotification', (data) => {
      this.notification.set(data);
    });
  }
}
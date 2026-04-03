import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiChatMessageDto {
  id: number;
  role: string;        // "user" veya "assistant"
  content: string;
  sentAt: string;
}

export interface AiChatRequestDto {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/AiChat';

  /**
   * Kullanıcı mesajını AI asistana gönderir, AI yanıtını döner.
   */
  sendMessage(message: string): Observable<AiChatMessageDto> {
    return this.http.post<AiChatMessageDto>(`${this.apiUrl}/send`, { message });
  }

  /**
   * Kullanıcının AI ile olan sohbet geçmişini getirir.
   */
  getHistory(): Observable<AiChatMessageDto[]> {
    return this.http.get<AiChatMessageDto[]>(`${this.apiUrl}/history`);
  }

  /**
   * Kullanıcının AI sohbet geçmişini temizler.
   */
  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/history`);
  }
}

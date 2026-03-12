import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal kullanarak performansı artırıyoruz
  isLoading = signal<boolean>(false);

  show() { this.isLoading.set(true); }
  hide() { this.isLoading.set(false); }
}
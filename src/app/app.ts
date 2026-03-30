import { Component, OnInit, effect, inject } from '@angular/core'; // effect eklendi
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from './layout/spinner/spinner';
import { ThemeService } from './core/services/themeService';
import { SignalrService } from './core/services/signalr';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './core/services/authService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'BankApp';

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
    private signalrService: SignalrService, // Servis burada uyanıyor
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.translate.setFallbackLang('en-US');

    // --- DOĞRU EFFECT KULLANIMI ---
    // effect, constructor içinde çağrılmalıdır. 
    // Signal her değiştiğinde bu blok otomatik tetiklenir.
    effect(() => {
      const data = this.signalrService.notification();
      if (data) {
        this.toastr.info(data.message, data.action || 'Sistem Bildirimi', {
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  ngOnInit(): void {
    const savedLang = localStorage.getItem('language') || 'en-US';
    this.translate.use(savedLang);
    this.themeService.loadSavedTheme();

    if (this.authService.isLoggedIn()) {
      this.signalrService.initHub();
    }
  }
}
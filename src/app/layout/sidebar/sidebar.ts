import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Router eklendi
import { AuthService } from '../../core/services/authService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  standalone: true, // Standalone olduğunu belirtmeyi unutma
  imports: [TranslateModule, RouterModule], // Şablon (HTML) için modül
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);

  // Hata buradaydı: RouterModule yerine Router inject edilmeli
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  isCollapsed = signal(false);

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  onLogout() {
    // 1. Servisteki temizlik operasyonunu başlat (Hem Local hem Session Storage temizlenir)
    this.authService.logout();

    // 2. Toast mesajı göster
    this.toastr.info(this.translate.instant('TOAST.LOGOUT_SUCCESS'), this.translate.instant('TOAST.LOGOUT_TITLE'));

    // 3. Kullanıcıyı login sayfasına yönlendir
    this.router.navigate(['/']);
  }
}
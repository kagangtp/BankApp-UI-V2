import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/authService';
import { MessageService } from '../../core/services/messageService';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  public messageService = inject(MessageService);

  isCollapsed = signal(false);
  searchTerm = '';

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.messageService.getHasUnread().subscribe({
        next: (res) => this.messageService.hasGlobalUnread.set(res.hasUnread),
        error: () => {}
      });
    }
  }

  navItems = [
    { path: '/mainpage/dashboard', icon: '📊', labelKey: 'SIDEBAR.DASHBOARD' },
    { path: '/mainpage/customers', icon: '👥', labelKey: 'SIDEBAR.CUSTOMERS' },
    { path: '/mainpage/accounts', icon: '💳', labelKey: 'SIDEBAR.ACCOUNTS', roles: ['Admin'] },
    { path: '/mainpage/transactions', icon: '💰', labelKey: 'SIDEBAR.TRANSACTIONS' },
    { path: '/mainpage/messages', icon: '💬', labelKey: 'SIDEBAR.MESSAGES' },
    { path: '/mainpage/send-email', icon: '✉️', labelKey: 'SIDEBAR.EMAIL', roles: ['Admin'] }, // Mail de admin olsun madem UserController öyleydi
  ];

  footerItems = [
    { path: '/mainpage/settings', icon: '⚙️', labelKey: 'SIDEBAR.SETTINGS' }
  ];

  hasAccess(item: any): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasRole(item.roles);
  }

  get filteredNavItems() {
    if (!this.searchTerm.trim()) return this.navItems;
    const term = this.searchTerm.toLowerCase();
    return this.navItems.filter(item =>
      this.translate.instant(item.labelKey).toLowerCase().includes(term)
    );
  }

  get filteredFooterItems() {
    if (!this.searchTerm.trim()) return this.footerItems;
    const term = this.searchTerm.toLowerCase();
    return this.footerItems.filter(item =>
      this.translate.instant(item.labelKey).toLowerCase().includes(term)
    );
  }

  toggleSidebar() {
    this.isCollapsed.update(v => {
      if (!v) this.searchTerm = ''; // Silindiğinde veya kapandığında aramayı sıfırla
      return !v;
    });
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
import { Component, HostListener, ViewChild } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { filter } from 'rxjs';

@Component({
  selector: 'app-mainpage',
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './mainpage.html',
  styleUrl: './mainpage.css',
})
export class Mainpage {
  isMobileSidebarOpen = false;

  @ViewChild('side') side!: Sidebar;

  constructor(private router: Router) {
    // Sayfa değiştiğinde mobil sidebar'ı kapat
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.closeMobileSidebar());
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  @HostListener('window:resize')
  onResize() {
    // Ekran genişlerse mobil sidebar'ı kapat
    if (window.innerWidth > 768) {
      this.isMobileSidebarOpen = false;
    }
  }
}

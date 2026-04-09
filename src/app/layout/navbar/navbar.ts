import { CommonModule } from '@angular/common';
import { Component, inject, Output, EventEmitter } from '@angular/core';
import { LanguageChanger } from '../../shared/components/language-changer/language-changer';
import { environment } from '../../../environments/environment';
import { UserService } from '../../core/services/userService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LanguageChanger],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private userService = inject(UserService);

  @Output() hamburgerClick = new EventEmitter<void>();

  userName: string = 'yükleniyor...';
  userInitial: string = '?';
  profilePhotoUrl: string | null = null;

  ngOnInit() {
    this.loadUserData();
  }

  onHamburgerClick() {
    this.hamburgerClick.emit();
  }

  loadUserData() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.username || 'Kullanıcı';
        this.userInitial = this.userName.charAt(0).toUpperCase();

        if (user.profilePhotoId) {
          this.profilePhotoUrl = `${environment.apiUrl}/Files/${user.profilePhotoId}/download`;
        } else {
          this.profilePhotoUrl = null;
        }
      },
      error: (err) => {
        console.warn('Kullanıcı bilgileri API\'dan alınamadı', err);
        this.userName = 'Misafir';
        this.userInitial = '?';
        this.profilePhotoUrl = null;
      }
    });
  }
}
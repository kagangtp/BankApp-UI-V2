import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  userName: string = 'yükleniyor...';
  userInitial: string = '?';
  profilePhotoUrl: string | null = null;

  ngOnInit() {
    this.loadUserData();
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
        // Fallback or handle logged out state
        this.userName = 'Misafir';
        this.userInitial = '?';
        this.profilePhotoUrl = null;
      }
    });
  }
}
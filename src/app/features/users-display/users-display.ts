import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserService, UserDto } from '../../core/services/userService';

@Component({
  selector: 'app-users-display',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './users-display.html',
  styleUrl: './users-display.css',
})
export class UsersDisplay implements OnInit {
  private userService = inject(UserService);

  users: UserDto[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Kullanıcılar yüklenemedi:', err);
        this.isLoading = false;
      }
    });
  }

  getRoleBadgeClass(role: string | null): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'badge-admin';
      case 'manager': return 'badge-manager';
      case 'staff': return 'badge-staff';
      default: return 'badge-default';
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserService, UserDto } from '../../core/services/userService';
import { AuthService } from '../../core/services/authService';

@Component({
  selector: 'app-users-display',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslateModule],
  templateUrl: './users-display.html',
  styleUrl: './users-display.css',
})
export class UsersDisplay implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users: UserDto[] = [];
  isLoading = true;
  isAdmin = false;
  currentUserId: number | null = null;

  ngOnInit() {
    this.checkAdminStatus();
    this.loadUsers();
  }

  checkAdminStatus() {
    this.isAdmin = this.authService.hasRole(['Admin']);
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userStr) {
      this.currentUserId = +JSON.parse(userStr).id;
    }
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

  promote(user: UserDto) {
    if (user.role === 'Admin') return;
    this.userService.promoteUser(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) this.users[index] = updatedUser;
      },
      error: (err) => console.error('Terfi işlemi başarısız:', err)
    });
  }

  demote(user: UserDto) {
    if (user.role === 'Staff' || !this.canDemote(user)) return;
    this.userService.demoteUser(user.id).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) this.users[index] = updatedUser;
      },
      error: (err) => console.error('Rütbe düşürme işlemi başarısız:', err)
    });
  }

  canDemote(user: UserDto): boolean {
    // Admin kendisini düşüremez (güvenlik için)
    return user.id !== this.currentUserId;
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

// layout/components/navbar/navbar.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LanguageChanger } from '../../shared/components/language-changer/language-changer';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LanguageChanger],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  userName: string = 'Misafir';
  userInitial: string = '?';

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.userName = user.firstName || 'Kullanıcı';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }


}
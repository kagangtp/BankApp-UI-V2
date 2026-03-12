import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-changer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-changer.html',
  styleUrl: './language-changer.css'
})
export class LanguageChanger {
  changeLanguage(lang: string) {
    localStorage.setItem('language', lang);
    window.location.reload();
  }
}

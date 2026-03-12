import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageChanger } from '../../shared/components/language-changer/language-changer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [TranslateModule, LanguageChanger],
  templateUrl: './landingpage.html',
  styleUrls: ['./landingpage.css']
})
export class Landingpage {
  private router = inject(Router);
  goToDashboard() {
    this.router.navigate(['mainpage/dashboard']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
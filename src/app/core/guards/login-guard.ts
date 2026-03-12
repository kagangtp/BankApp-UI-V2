import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Zaten giriş yapmışsa (token varsa)
  if (authService.isLoggedIn()) {
    // Dashboard'a şutla
    router.navigate(['/mainpage/dashboard']);
    return false; // Login sayfasının açılmasına izin verme
  }

  // Giriş yapmamışsa (token yoksa) geçebilir
  return true;
};
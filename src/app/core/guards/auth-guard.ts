import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService'; // Kendi dosya yoluna göre kontrol et

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService); // Servisi inject ediyoruz

  // Artık hem local hem session kontrolünü servis üzerinden merkezi yapıyoruz
  if (authService.isLoggedIn()) {
    return true;
  }

  // Token yoksa girişe yönlendir
  console.warn('Yetkisiz erişim engellendi, Login sayfasına yönlendiriliyorsunuz...');
  router.navigate(['/login']);
  return false;
};
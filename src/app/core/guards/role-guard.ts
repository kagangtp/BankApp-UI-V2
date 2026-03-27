import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Rota verisinden beklenen rolleri al
  const allowedRoles = route.data['roles'] as string[];

  // Eğer kısıtlama yoksa veya kullanıcı rol sahibiyse izin ver
  if (!allowedRoles || allowedRoles.length === 0 || authService.hasRole(allowedRoles)) {
    return true;
  }

  // Yetkisi yoksa unauthorized sayfasına yönlendir
  console.warn(`Yetkisiz erişim denemesi: ${state.url}. Gerekli roller: ${allowedRoles}`);
  router.navigate(['/unauthorized']);
  return false;
};

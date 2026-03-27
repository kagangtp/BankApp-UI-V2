import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

export const permissionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Rota verisinden beklenen yetkileri (permissions) al
    const requiredPermissions = route.data['permissions'] as string[];

    // Eğer rotada spesifik bir yetki kısıtlaması yoksa erişime izin ver
    if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
    }

    // Kullanıcının gerekli yetkilere sahip olup olmadığını kontrol et
    // (Burada mantığı ihtiyacına göre "hepsine sahip olmalı" (AND) veya "herhangi birine sahip olmalı" (OR) şeklinde AuthService içinde kurabiliriz)
    if (authService.hasPermission(requiredPermissions)) {
        return true;
    }

    // Yetkisi yoksa unauthorized sayfasına yönlendir
    console.warn(`Yetkisiz erişim denemesi: ${state.url}. Gerekli yetkiler: ${requiredPermissions.join(', ')}`);
    router.navigate(['/unauthorized']);
    return false;
};
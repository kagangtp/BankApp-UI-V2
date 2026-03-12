import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/authService';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

// Aynı anda birden fazla 401 gelirse, sadece bir kez refresh yapması için
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Auth endpoint'lerine withCredentials ekle (cookie gönderimi için)
  if (req.url.includes('/api/auth')) {
    req = req.clone({ withCredentials: true });
  }

  // Token varsa header'a ekle
  const token = authService.getToken();
  if (token) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 geldi ve refresh/login/register endpoint'i değilse → token yenile
      if (error.status === 401 && !isAuthUrl(req.url)) {
        return handleTokenRefresh(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

function isAuthUrl(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
}

function handleTokenRefresh(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        isRefreshing = false;

        if (response.success) {
          const newToken = response.data.accessToken;
          refreshTokenSubject.next(newToken);
          // Orijinal isteği yeni token ile tekrar gönder
          return next(addTokenToRequest(req, newToken));
        } else {
          // Refresh başarısız → login'e yönlendir
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => new Error('Token yenilenemedi'));
        }
      }),
      catchError(err => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  } else {
    // Başka bir istek zaten refresh yapıyor, yeni token'ı bekle
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenToRequest(req, token!)))
    );
  }
}
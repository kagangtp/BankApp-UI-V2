import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Get the language from storage (default to 'tr' or 'tr-TR')
  const lang = localStorage.getItem('language') || 'tr-TR';

  // 2. Clone the request and inject the header
  // This matches the "Content Language" interceptor in your architect's plan
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': lang
    }
  });

  // 3. Send the modified request to the Backend (Ekle, Sil, Güncelle, etc.)
  return next(clonedRequest);
};
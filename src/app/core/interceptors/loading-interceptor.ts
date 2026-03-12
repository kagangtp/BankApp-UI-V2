import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loadingService';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  loadingService.show(); // İstek başladığında çarkı aç

  return next(req).pipe(
    finalize(() => {
      loadingService.hide(); // İstek bittiğinde (hata olsa bile) çarkı kapat
    })
  );
};
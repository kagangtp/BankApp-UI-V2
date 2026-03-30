import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { SingleResponseModel } from '../models/responses/single-response-model';
import { ResponseModel } from '../models/responses/response-model';
import { environment } from '../../../environments/environment';
import { SignalrService } from './signalr';

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private signalrService = inject(SignalrService);
  private authUrl = environment.apiUrl + '/auth';

  // --- Login ---
  login(loginData: any): Observable<SingleResponseModel<LoginResponse>> {
    return this.http.post<SingleResponseModel<LoginResponse>>(
      `${this.authUrl}/login`,
      loginData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.saveToken(response.data.accessToken, loginData.rememberMe);
          this.signalrService.initHub();
        }
      })
    );
  }

  // --- Register ---
  register(registerData: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.authUrl}/register`, registerData);
  }

  // --- Refresh Token ---
  refreshToken(): Observable<SingleResponseModel<LoginResponse>> {
    return this.http.post<SingleResponseModel<LoginResponse>>(
      `${this.authUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
          storage.setItem('token', response.data.accessToken);
          // Token yenilendiğinde user objesini de güncelliyoruz
          this.saveToken(response.data.accessToken, !!localStorage.getItem('token'));
          this.signalrService.initHub();
        }
      })
    );
  }

  // --- Revoke (Logout) ---
  revokeToken(): Observable<any> {
    return this.http.post(
      `${this.authUrl}/revoke`,
      {},
      { withCredentials: true }
    );
  }

  // --- Logout ---
  logout() {

    this.signalrService.stopHub();

    this.revokeToken().subscribe({
      next: () => console.log('Refresh token iptal edildi.'),
      error: () => console.warn('Revoke başarısız oldu, yine de çıkış yapılıyor.')
    });

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  // --- Token Helpers ---
  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  saveToken(token: string, rememberMe: boolean = false) {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }

    try {
      const decodedToken: any = jwtDecode(token);

      const user = {
        id: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedToken.nameid || decodedToken.sub,
        email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decodedToken.email,
        role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role,

        // YENİ: Backend'den gelecek custom permissions claim'ini yakalıyoruz
        permissions: decodedToken.permissions || decodedToken.Permissions || []
      };

      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (e) {
      console.error("Token decode error:", e);
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // --- Permission Check Helper (YENİ) ---
  hasPermission(requiredPermissions: string[]): boolean {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      if (!user.permissions) return false;

      const userPermissions: string[] = Array.isArray(user.permissions) ? user.permissions : [user.permissions];

      // İstenen yetkilerden herhangi birine sahipse true döner (.every() kullanarak "hepsine sahip olmalı" şeklinde de değiştirebilirsin)
      return requiredPermissions.some(p => userPermissions.includes(p));
    } catch {
      return false;
    }
  }

  // --- Role Check Helper (Geriye dönük uyumluluk veya UI logic için bırakıldı) ---
  hasRole(allowedRoles: string[]): boolean {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      if (!user.role) return false;

      const userRoles: string[] = Array.isArray(user.role) ? user.role : [user.role];
      return userRoles.some(r => allowedRoles.includes(r));
    } catch {
      return false;
    }
  }
}
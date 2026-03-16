import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { SingleResponseModel } from '../models/responses/single-response-model';
import { ResponseModel } from '../models/responses/response-model';
import { environment } from '../../../environments/environment';

// Backend'den dönen LoginResponseDto'ya karşılık gelen interface
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
  private authUrl = environment.apiUrl + '/auth';

  // --- Login ---
  login(loginData: any): Observable<SingleResponseModel<LoginResponse>> {
    return this.http.post<SingleResponseModel<LoginResponse>>(
      `${this.authUrl}/login`,
      loginData,
      { withCredentials: true } // Cookie'yi almak için şart
    );
  }

  // --- Register ---
  register(registerData: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.authUrl}/register`, registerData);
  }

  // --- Refresh Token ---
  // 401 alınca interceptor tarafından otomatik çağrılacak
  refreshToken(): Observable<SingleResponseModel<LoginResponse>> {
    return this.http.post<SingleResponseModel<LoginResponse>>(
      `${this.authUrl}/refresh`,
      {},
      { withCredentials: true } // HttpOnly cookie otomatik gönderilir
    ).pipe(
      tap(response => {
        if (response.success) {
          // Yeni access token'ı her iki storage'a da yaz (hangisi aktifse)
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
          storage.setItem('token', response.data.accessToken);
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
    // Önce backend'deki token'ı iptal et
    this.revokeToken().subscribe({
      next: () => console.log('Refresh token iptal edildi.'),
      error: () => console.warn('Revoke başarısız oldu, yine de çıkış yapılıyor.')
    });

    // Ardından local verileri temizle
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
            role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role
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
}
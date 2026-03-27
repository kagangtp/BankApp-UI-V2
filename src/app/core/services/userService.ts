import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string | null;
  profilePhotoId: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/User';

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  promoteUser(id: number): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/${id}/promote`, {});
  }

  demoteUser(id: number): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/${id}/demote`, {});
  }
}

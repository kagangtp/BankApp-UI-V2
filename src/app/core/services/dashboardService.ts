import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SystemStats {
  totalAccounts: number;
  globalBalance: number;
  averageBalance: number;
  calculationDate: string;
}

export interface MonthlyRegistration {
  month: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/Calculator';

  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/system-stats`);
  }

  getMonthlyRegistrations(months: number = 6): Observable<MonthlyRegistration[]> {
    return this.http.get<MonthlyRegistration[]>(`${this.apiUrl}/monthly-registrations?months=${months}`);
  }
}

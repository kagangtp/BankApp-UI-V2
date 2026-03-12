import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerParams } from '../models/params/customer-params';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/Customer/export'; // Direkt export endpointi

  /**
   * 1. API'den Excel verisini çeken metod
   */
  getCustomersExcel(params: CustomerParams): Observable<Blob> {
    let queryParams = new HttpParams()
      .set('sort', params.sort)
      .set('pageSize', '1000000') // Export için tüm veriyi istiyoruz
      .set('lastId', '0');

    if (params.searchTerm) {
      queryParams = queryParams.set('search', params.searchTerm);
    }

    return this.http.get(this.apiUrl, { 
      params: queryParams, 
      responseType: 'blob' 
    });
  }

  /**
   * 2. Gelen Blob verisini tarayıcıda indiren yardımcı metod
   */
  saveAsExcel(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    
    // Temizlik
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
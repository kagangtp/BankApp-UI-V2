import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/Files';

    upload(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<any>(`${this.apiUrl}/upload`, formData);
    }

    assignOwner(fileId: string, ownerId: number, ownerType: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${fileId}/assign`, { ownerId, ownerType });
    }

    getByOwner(ownerType: string, ownerId: number): Observable<any> {
        return this.http.get<any>(this.apiUrl, { params: { ownerType, ownerId } });
    }

    downloadAsBlob(fileId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${fileId}/download`, { responseType: 'blob' });
    }

    deleteFile(fileId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${fileId}`);
    }
}

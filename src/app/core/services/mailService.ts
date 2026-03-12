import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
    providedIn: 'root',
})
export class MailService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/Mail';

    send(mail: { to: string; subject: string; body: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/send`, mail);
    }
}

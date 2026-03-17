import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { House } from '../models/house';
import { SingleResponseModel } from '../models/responses/single-response-model';
import { ListResponseModel } from '../models/responses/list-response-model';
import { ResponseModel } from '../models/responses/response-model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HouseService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/House';

    getHousesByCustomer(customerId: number): Observable<ListResponseModel<House>> {
        return this.http.get<ListResponseModel<House>>(`${this.apiUrl}/customer/${customerId}`);
    }

    getHouseById(id: number): Observable<SingleResponseModel<House>> {
        return this.http.get<SingleResponseModel<House>>(`${this.apiUrl}/${id}`);
    }

    createHouse(house: { address: string; description?: string; customerId: number }): Observable<SingleResponseModel<number>> {
        return this.http.post<SingleResponseModel<number>>(this.apiUrl, house);
    }

    updateHouse(house: { id: number; address: string; description?: string }): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(this.apiUrl, house);
    }

    deleteHouse(id: number): Observable<ResponseModel> {
        return this.http.delete<ResponseModel>(`${this.apiUrl}/${id}`);
    }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car';
import { SingleResponseModel } from '../models/responses/single-response-model';
import { ListResponseModel } from '../models/responses/list-response-model';
import { ResponseModel } from '../models/responses/response-model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CarService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/Car';

    getCarsByCustomer(customerId: number): Observable<ListResponseModel<Car>> {
        return this.http.get<ListResponseModel<Car>>(`${this.apiUrl}/customer/${customerId}`);
    }

    getCarById(id: number): Observable<SingleResponseModel<Car>> {
        return this.http.get<SingleResponseModel<Car>>(`${this.apiUrl}/${id}`);
    }

    createCar(car: { plate: string; description?: string; customerId: number }): Observable<SingleResponseModel<number>> {
        return this.http.post<SingleResponseModel<number>>(this.apiUrl, car);
    }

    updateCar(car: { id: number; plate: string; description?: string }): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(this.apiUrl, car);
    }

    deleteCar(id: number): Observable<ResponseModel> {
        return this.http.delete<ResponseModel>(`${this.apiUrl}/${id}`);
    }
}

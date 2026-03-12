import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // 1. Bunu ekle
import { Observable } from 'rxjs'; // 2. Bunu ekle
import { Customer } from '../models/customer'; // Interface yolun
import { CustomerUpdateDto } from '../models/customer-update-dto';
import { CustomerDeleteDto } from '../models/customer-delete-dto';
import { ListResponseModel } from '../models/responses/list-response-model';
import { SingleResponseModel } from '../models/responses/single-response-model';
import { ResponseModel } from '../models/responses/response-model';
import { CustomerParams } from '../models/params/customer-params';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient); // 3. Http bağımlılığını enjekte et
  private apiUrl = environment.apiUrl + '/Customer'; // 4. Backend portunu buraya yaz

  // "Getir" - Now expects the ListResponseModel wrapper
  getCustomers(params: CustomerParams): Observable<ListResponseModel<Customer>> {
    let queryParams = new HttpParams()
      .set('sort', params.sort)
      .set('pageSize', params.pageSize.toString())
      .set('lastId', params.lastId.toString());

    // Only add the search term to the URL if the user actually typed something
    if (params.searchTerm && params.searchTerm.trim() !== '') {
      queryParams = queryParams.set('search', params.searchTerm);
    }

    // This sends the request with the query string attached
    return this.http.get<ListResponseModel<Customer>>(this.apiUrl, { params: queryParams });
    }

  // "GetirById"
  getCustomerById(id: number): Observable<SingleResponseModel<Customer>> {
    return this.http.get<SingleResponseModel<Customer>>(`${this.apiUrl}/${id}`);
  }

  // "Güncelle" - Returns ResponseModel (success/message)
  updateCustomer(customer: CustomerUpdateDto): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(this.apiUrl, customer);
  }

  // "Sil" - Uses the DeleteDto in the body
  deleteCustomer(id: number): Observable<ResponseModel> {
    const deleteDto: CustomerDeleteDto = { id: id };
    return this.http.delete<ResponseModel>(this.apiUrl, { body: deleteDto });
  }

  // "Ekle" - Returns ResponseModel
  createCustomer(customer: any): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(this.apiUrl, customer);
  }
}
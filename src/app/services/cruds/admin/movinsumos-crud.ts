import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class MovinsumosCrud {

  private apiUrl = `${environment.apiUrl}Admin/MovInsumos/`;

  constructor(private http: HttpClient) { }

  getMovInsumos(id_cendis: number, page = 1, pageSize = 100) {
    return this.http.get(
      `${this.apiUrl}${id_cendis}?page=${page}&pageSize=${pageSize}`,
      { withCredentials: true }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AccesosCrud {

  private apiUrl = `${environment.apiUrl}Admin/Accesos/`;//URL base de la API
  
  constructor(private http: HttpClient) { }

  getAccesos(id_cendis: number, page = 1, pageSize = 100) {
    return this.http.get(
      `${this.apiUrl}${id_cendis}?page=${page}&pageSize=${pageSize}`,
      { withCredentials: true }
    );
  }
}

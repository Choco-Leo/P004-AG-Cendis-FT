import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadesCrud {
  constructor(private http: HttpClient) { }
  apiUrl = `${environment.apiUrl}Catalogo/Unidades`;

  getUnidades() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }

  createUnidades(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }

  updateUnidades(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }

  deleteUnidades(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
}

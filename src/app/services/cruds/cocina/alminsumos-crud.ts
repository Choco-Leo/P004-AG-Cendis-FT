import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AlminsumosCrud {
  apiUrl = `${environment.apiUrl}Cocina/AlmInsumos`;

  constructor(private http: HttpClient) { }

  getAlmInsumos(id_cendis?: number) {
    const url = (id_cendis !== undefined && id_cendis !== null)
      ? `${this.apiUrl}/${id_cendis}`
      : `${this.apiUrl}`;
    return this.http.get(url, { withCredentials: true });
  }

  editAlmInsumo(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData, { withCredentials: true });
  }

}

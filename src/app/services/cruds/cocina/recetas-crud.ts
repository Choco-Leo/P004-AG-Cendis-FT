import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class RecetasCrud {
  apiUrl = `${environment.apiUrl}Cocina/Recetas`;

  constructor(private http: HttpClient) { }

  getRecetas(id_cendis?: number) {
    const url = (id_cendis !== undefined && id_cendis !== null)
      ? `${this.apiUrl}/${id_cendis}`
      : `${this.apiUrl}`;
    return this.http.get(url, { withCredentials: true });
  }

  getRecetasDescrip(id: number) {
    return this.http.get(`${this.apiUrl}/Descrip/${id}`, { withCredentials: true });
  }
  
  createReceta(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData, { withCredentials: true });
  }

  updateReceta(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData, { withCredentials: true });
  }

  deleteReceta(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}

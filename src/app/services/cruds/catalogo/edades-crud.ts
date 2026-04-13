import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class EdadesCrud {
  
  apiUrl = `${environment.apiUrl}Catalogo/Edades`;
  
  constructor(private http: HttpClient) { }

  getEdades() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }
  
  createEdad(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }
  
  updateEdad(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }
  
  deleteEdad(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
}

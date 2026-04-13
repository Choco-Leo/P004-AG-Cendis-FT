import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class PresentacionesCrud {

  apiUrl = `${environment.apiUrl}Catalogo/Presentaciones`;
  
  constructor(private http: HttpClient) { }

  getPresentaciones() {
    return this.http.get(this.apiUrl,{withCredentials: true});
  }
  
  createPresentaciones(formData: any) {
    return this.http.post(this.apiUrl, formData,{withCredentials: true});
  }
  
  updatePresentaciones(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }
  
  deletePresentaciones(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class HorariosCrud {
  
  apiUrl = `${environment.apiUrl}Catalogo/Horarios`; 
  
  constructor(private http: HttpClient) { }

  getHorarios() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }
  
  createHorarios(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }
  
  updateHorarios(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }
  
  deleteHorarios(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
}

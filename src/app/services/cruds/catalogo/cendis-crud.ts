import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class CendisCrud {

  private apiUrl = `${environment.apiUrl}Catalogo/Cendis`;
  
  constructor(private http: HttpClient) { }

  getCendis() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }

  createCendis(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }

  updateCendis(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }

  deleteCendis(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
  //////////////////////////////////////

  getCendisAccesos() {
    return this.http.get(`${this.apiUrl}A`,{withCredentials: true});
  }
}

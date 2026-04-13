import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class CargosCrud {
  private apiUrl = `${environment.apiUrl}Admin/Cargos`;
  
  constructor(private http: HttpClient) { }

  getCargos() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }

  createCargos(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }

  updateCargos(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }

  deleteCargos(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }

  getCargosCU() {
    return this.http.get(`${this.apiUrl}CU`,{withCredentials: true});
  }
}

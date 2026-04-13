import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class CatinsumosCrud {

  apiUrl = `${environment.apiUrl}Cocina/CatInsumos`;

  constructor(private http: HttpClient) { }

  getCatInsumos() {
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }

  createCatInsumo(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }

  editCatInsumo(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }

  deleteCatInsumo(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }
}

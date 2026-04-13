import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class UsersCrud {
  
  private apiUrl = `${environment.apiUrl}Admin/User`;

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get(`${this.apiUrl}`,{withCredentials: true});
  }

  createUsers(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData,{withCredentials: true});
  }

  updateUsers(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData,{withCredentials: true});
  }

  deleteUsers(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`,{withCredentials: true});
  }

  // FIRMA AUTORIZADA
  getFirma() {
    const firmaUrl = `${environment.apiUrl}Admin/Firma`;
    return this.http.get(firmaUrl, { withCredentials: true });
  }

  updateFirma(nombre: string) {
    const firmaUrl = `${environment.apiUrl}Admin/Firma`;
    return this.http.put(firmaUrl, { nombre }, { withCredentials: true });
  }
  
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class MenusCrud {
  apiUrl = `${environment.apiUrl}Cocina/Menus`;

  constructor(private http: HttpClient) { }

  getMenus() {
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }
  
  createMenu(formData: any) {
    return this.http.post(`${this.apiUrl}`, formData, { withCredentials: true });
  }
  
  updateMenu(formData: any) {
    return this.http.put(`${this.apiUrl}/${formData.id}`, formData, { withCredentials: true });
  }
  
  deleteMenu(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}

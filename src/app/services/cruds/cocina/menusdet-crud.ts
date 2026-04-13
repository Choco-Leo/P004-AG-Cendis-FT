import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})

export class MenusdetCrud {
  apiUrl = `${environment.apiUrl}Cocina/Menus/DetMenu`;
  constructor(private http: HttpClient) {}
  getMenusDet(id_menus: number) {
    return this.http.get(`${this.apiUrl}/${id_menus}`, { withCredentials: true });
  }
  createMenusDet(id_menus: number, id_recetas: number) {
    const body = { id_menus, id_recetas };
    return this.http.post(`${this.apiUrl}`, body, { withCredentials: true });
  }
  createMenusDetBatch(id_menus: number, detalles: Array<{ id_recetas: number }>) {
    const body = { id_menus, detalles };
    return this.http.post(`${this.apiUrl}`, body, { withCredentials: true });
  }
  deleteMenusDetByMenuId(id_menus: number) {
    return this.http.delete(`${this.apiUrl}/ByMenu/${id_menus}`, { withCredentials: true });
  }
}

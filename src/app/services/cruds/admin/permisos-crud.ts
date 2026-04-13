import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class PermisosCrud {
  private apiUrlAS = `${environment.apiUrl}Admin/PermisosAS`;
  private apiUrlNA = `${environment.apiUrl}Admin/PermisosNA`;

  constructor(private http: HttpClient) { }

  getPermisosAsignados(id_cargos: number) {
    return this.http.get<any>(`${this.apiUrlAS}/${id_cargos}`, { withCredentials: true });
  }

  getPermisosNoAsignados(id_cargos: number) {
    return this.http.get<any>(`${this.apiUrlNA}/${id_cargos}`, { withCredentials: true });
  }
}

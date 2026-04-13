import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class CargosPermisosCrud {
  private apiUrl = `${environment.apiUrl}Admin/CargosPermisos`;

  constructor(private http: HttpClient) { }

  asignarPermisosACargo(id_cargos: number, permisosIds: number[], activo = 1) {
    return this.http.post<any>(
      `${this.apiUrl}`,{ id_cargos, permisosIds, activo },{ withCredentials: true }
    );
  }

  eliminarPermisosDeCargo(id_cargos: number, permisosIds: number[]) {
    return this.http.delete<any>(
      `${this.apiUrl}`,{ body: { id_cargos, permisosIds }, withCredentials: true }
    );
  }
}

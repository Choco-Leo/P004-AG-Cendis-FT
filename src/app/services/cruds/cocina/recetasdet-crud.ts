import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class RecetasdetCrud {
  apiUrl = `${environment.apiUrl}Cocina/Recetas/DetRec`;

  constructor(private http: HttpClient) { }

  getRecetasDet(id_recetas: number) {
    return this.http.get(`${this.apiUrl}/${id_recetas}`, { withCredentials: true });
  }

  createRecetasDetBatch(id_recetas: number, detalles: Array<{ id_cat_insumos: number; porcion: number }>) {
    const body = { id_recetas, detalles };
    return this.http.post(`${this.apiUrl}`, body, { withCredentials: true });
  }

  deleteRecetasDetBatch(ids: number[]) {
    const body = { ids };
    return this.http.request('DELETE', `${this.apiUrl}`, { body, withCredentials: true });
  }

  deleteRecetasDetByRecetaId(id_recetas: number) {
    return this.http.delete(`${this.apiUrl}/ByReceta/${id_recetas}`, { withCredentials: true });
  }
}

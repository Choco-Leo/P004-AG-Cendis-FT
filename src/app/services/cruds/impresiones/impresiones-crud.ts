import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class ImpresionesCrud {

  private apiUrl = `${environment.apiUrl}Impresiones`	;

  constructor(private http: HttpClient) {}

  getInsumosMenuByRangoEdad(id_menu: number) {
    return this.http.post(`${this.apiUrl}/Menu`, { id_menu }, { withCredentials: true });
  }

  getDetallesPedido(id_pedido: number, id_cendis?: number, categoria?: string) {
    const body: any = { id_pedido };
    if (id_cendis) {
        body.id_cendis = id_cendis;
    }
    if (categoria) {
        body.categoria = categoria;
    }
    return this.http.post(`${this.apiUrl}/Pedido`, body, { withCredentials: true });
  }

  getDetallesPedidoExcel(id_pedido: number, id_cendis?: number, categoria?: string) {
    const body: any = { id_pedido };
    if (id_cendis) {
        body.id_cendis = id_cendis;
    }
    if (categoria) {
        body.categoria = categoria;
    }
    return this.http.post(`${this.apiUrl}/PedidoExcel`, body, { withCredentials: true });
  }

  getRangoFchDetPedidosXCendis(fh_inicio: string, fh_fin: string, cendis?: number[]) {
    const body: any = { fh_inicio, fh_fin };
    if (cendis) {
        body.cendis = cendis;
    }
    return this.http.post(`${this.apiUrl}/RangoPedido`, body, { withCredentials: true });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class PedidosCrud {
  private apiUrl = `${environment.apiUrl}Pedidos`;

  constructor(private http: HttpClient) { }

  validarMenu(fch: string, id_cendis?: number) {
    const url = id_cendis !== undefined && id_cendis !== null
      ? `${this.apiUrl}/ValidarMenu/${id_cendis}`
      : `${this.apiUrl}/ValidarMenu`;

    return this.http.post(url, { fch }, { withCredentials: true });
  }

  getPedidos(fch: string, id_cendis?: number) {
    const body: any = { fch };
    if (id_cendis !== undefined && id_cendis !== null) {
      body.id_cendis = id_cendis;
    }
    return this.http.post(`${this.apiUrl}/Consulta`, body, { withCredentials: true });
  }

  getPedidosDetalles(id_pedido: number) {
    return this.http.post(`${this.apiUrl}/Consulta/Detalles`, { id_pedido }, { withCredentials: true });
  }

  getPedidosSecciones(id_pedido: number) {
    return this.http.post(`${this.apiUrl}/Consulta/Secciones`, { id_pedido }, { withCredentials: true });
  }

  getPedidosDetallesSecciones(id_pedido: number, id_pedidos_secciones: number) {
    return this.http.post(
      `${this.apiUrl}/Consulta/Secciones/Detalles`,
      { id_pedido, id_pedidos_secciones },
      { withCredentials: true }
    );
  }

  updatePedidosDetalles(id_pedido: number, detalle: { id_cat_insumos: number; cantidad_sugerida: number }[], password?: string) {
    const body: any = { id_pedido, detalle };
    if (password) {
      body.password = password;
    }
    return this.http.put(
      `${this.apiUrl}/Detalles`,
      body,
      { withCredentials: true }
    );
  }

  createPedido(payload: {
    fch: string;
    detallesSecciones: { id_rango_edades: number; ninos: number }[];
    id_cendis?: number;
  }) {
    return this.http.post(`${this.apiUrl}`, payload, { withCredentials: true });
  }

  cancelarPedido(id_pedido: number, cancelado: boolean, password?: string) {
    const body: any = { id_pedido, cancelado };
    if (password) {
      body.password = password;
    }
    return this.http.put(`${this.apiUrl}/Cancelar`, body, { withCredentials: true });
  }
}

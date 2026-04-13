import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarioCrud {
  apiUrl = `${environment.apiUrl}Calendario/CalendarioM`;

  constructor(private http: HttpClient) { }

  getCalendario(fch: string) {
    return this.http.get(`${this.apiUrl}`, {
      params: { fch },
      withCredentials: true
    });
  }

  createCalendario(payload: any) {
    return this.http.post(`${this.apiUrl}`, payload, { withCredentials: true });
  }

  updateCalendario(payload: any) {
    return this.http.put(`${this.apiUrl}`, payload, { withCredentials: true });
  }
}

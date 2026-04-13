import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { map, catchError, Observable, shareReplay, of, tap, BehaviorSubject } from 'rxjs';

// Interface de la sesión de usuario
export interface SessionUser {
  id: number;
  nombre: string;
  apellido_p?: string;
  apellido_m?: string;
  id_cendis: number;
  login_cendi: string;
  id_cargos: number;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private apiUrl = environment.apiUrl;//URL base de la API
  private isAuthenticated = false;//Indica si el usuario está autenticado
  private isLoggedInCached$?: Observable<boolean>;//Cache para el estado de login
  private userSubject = new BehaviorSubject<SessionUser | null>(null);//Subject(Es el que almacena el usuario autenticado) para el usuario autenticado
  public user$ = this.userSubject.asObservable();//Observable para el usuario autenticado(Emite el usuario autenticado)

  constructor(private http: HttpClient) { } //Inyecta el servicio HttpClient para realizar peticiones HTTP
  
  // Método para iniciar sesión
  login(credentials: {login_cendi: string, password_cendi: string}) {
    const options = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this.http.post(`${this.apiUrl}login`, credentials, options).pipe(
      map((response: any) => {
        if (response.success) {
          if (response.data) {
            this.userSubject.next(response.data as SessionUser);//Mantiene el usuario en memoria
          }
          this.refreshSessionCheck();
        }
        return response;
      })
    );
  }

  // Método para cerrar sesión
  logout() {
    return this.http.post(`${this.apiUrl}logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.userSubject.next(null)), // limpia el usuario en memoria
      map(() => this.refreshSessionCheck())//Invalidar el cache al cerrar sesión
    );
  }

  //Metodo para verificar si el usuario está autenticado
  isLoggedIn$(): Observable<boolean> {
    if (!this.isLoggedInCached$) {
      this.isLoggedInCached$ = this.http.get<{ isLoggedIn: boolean, user: SessionUser }>(`${this.apiUrl}checkSession`, { withCredentials: true })
        .pipe(
          tap(r => this.userSubject.next(r.isLoggedIn ? r.user : null)), //Mantiene el usuario en memoria
          map(r => r.isLoggedIn), //Transforma la respuesta en un booleano
          catchError(() => {
            this.userSubject.next(null);
            return of(false);
          }),
          shareReplay({ bufferSize: 1, refCount: true })//Cachea el resultado para reutilizarlo en múltiples suscriptores
        );
    }
    return this.isLoggedInCached$;
  }

  //Metodo para refrescar la verificación de sesión
  refreshSessionCheck(): void {
    this.isLoggedInCached$ = undefined;//Invalidar el cache para forzar una nueva verificación
  }

  //Metodo para obtener el usuario autenticado
  getUser(): SessionUser | null {
    return this.userSubject.value;
  }
}

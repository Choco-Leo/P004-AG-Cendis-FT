import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  
  //Inyecta los servicios AuthService y Router
  const auth = inject(AuthService);
  const router = inject(Router);

  //Retorna un observable que emite true si el usuario está autenticado, de lo contrario redirige al login
  return auth.isLoggedIn$().pipe(take(1),//Toma solo el primer valor emitido por el observable (isLoggedIn: boolean)
    map(isLogged => (isLogged ? true : router.createUrlTree([''])))//Redirigir al login si no está autenticado
  );
};
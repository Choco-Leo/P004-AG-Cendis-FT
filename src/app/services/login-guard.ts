import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { map, take } from 'rxjs';

export const loginGuard: CanActivateFn = () => {

  //Inyecta los servicios AuthService y Router
  const authService = inject(AuthService);
  const router = inject(Router);

  //Retorna un observable que valida si el usuario no está autenticado, de lo contrario redirige al dashbord
  return authService.isLoggedIn$().pipe(take(1),
    map(isLogged => (isLogged ? router.createUrlTree(['Dashbord']) : true))//Redirigir al dashbord si ya está autenticado
  );
};
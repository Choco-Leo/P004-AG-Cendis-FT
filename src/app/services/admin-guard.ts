import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { map, take } from 'rxjs/operators';
import { AlertService } from './alert';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alert = inject(AlertService);

  return auth.isLoggedIn$().pipe(
    take(1),
    map(isLogged => {
      if (!isLogged) {
        return router.createUrlTree(['']);
      }
      
      const user = auth.getUser();
      if (user && user.id_cargos === 1) {
        return true;
      }

      alert.show('Acceso denegado: Se requieren permisos de administrador', 'warning');
      return router.createUrlTree(['Dashbord']);
    })
  );
};

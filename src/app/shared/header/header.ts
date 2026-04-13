import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {

  isMenuOpen = signal(false);
  
  private userSub?: Subscription;

  private linksAdmin = [
    { path: '/Dashbord', label: 'Dashboard' },
    { path: '/Admin', label: 'Admin' },
    { path: '/Catalogo', label: 'Catálogo' },
    { path: '/Cocina', label: 'Cocina' },
    { path: '/Pedidos', label: 'Pedidos' },
    { path: '/Calendario', label: 'Calendario' },
    { path: '/Impresiones', label: 'Impresiones' },
  ];

  private linksUser = [
    { path: '/Dashbord', label: 'Dashboard' },
    { path: '/Cocina', label: 'Cocina' },
    { path: '/Pedidos', label: 'Pedidos' },
    { path: '/Impresiones', label: 'Impresiones' },
  ];

  links = this.linksUser;

  constructor(private authService: AuthService, private router: Router) {}

  // Método para alternar el estado del menú (abrir/cerrar)
  toggleMenu() {
    const next = !this.isMenuOpen();
    this.isMenuOpen.set(next);
  }
  // Método para cerrar el menú (solo si está abierto)
  closeMenu() {
    if (this.isMenuOpen()) { 
      this.isMenuOpen.set(false); 
    }
  } 
  // Método para navegar a una ruta y cerrar el menú
  navAndClose(path: string) { 
    this.router.navigate([path]); 
    this.closeMenu(); 
  }
  // Método para cerrar el menú cuando se redimensiona la ventana
  private resizeHandler = () => {
    if (window.innerWidth > 920 && this.isMenuOpen()) {
      this.closeMenu();
    }
  };  

  // Método para cerrar sesión y redirigir a la página de inicio
  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Error al cerrar sesión')
    });
  }
  // Método para inicializar el componente y agregar el evento de redimensionamiento
  ngOnInit() {
    window.addEventListener('resize', this.resizeHandler);

    // Suscribir al usuario para actualizar la lista de links basada en el rol
    this.userSub = this.authService.user$.subscribe(user => {
      const isAdmin = !!user && user.id_cargos === 1; // Ajusta el ID si tu enum difiere
      this.links = isAdmin ? this.linksAdmin : this.linksUser;
    });
  }
  // Método para destruir el componente y remover el evento de redimensionamiento
  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    this.userSub?.unsubscribe();
  }
}
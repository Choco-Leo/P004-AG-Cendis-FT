import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cocina',
  imports: [CommonModule, RouterModule],
  templateUrl: './cocina.html',
  styleUrl: './cocina.css'
})
export class Cocina implements OnInit {
  private authService = inject(AuthService);

  links: any[] = [];

  private allLinks = [
    { path: '/Cocina/CatInsumos', label: 'Catálogo Insumos', adminOnly: true },
    { path: '/Cocina/AlmInsumos', label: 'Almacén Insumos', adminOnly: false },
    { path: '/Cocina/Recetas', label: 'Recetas', adminOnly: false },
    { path: '/Cocina/Menus', label: 'Menús', adminOnly: false }
  ];

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      const isAdmin = user?.id_cargos === 1;
      this.links = this.allLinks.filter(link => !link.adminOnly || isAdmin);
    });
  }
}

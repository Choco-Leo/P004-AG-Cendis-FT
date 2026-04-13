import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  links = [
    { path: '/Admin/User', label: 'Usuarios' },
    { path: '/Admin/Accesos', label: 'Accesos' },
    { path: '/Admin/MovInsumos', label: 'Movimientos Insumos' },
    { path: '/Admin/Cargos', label: 'Cargos' }
  ];
}
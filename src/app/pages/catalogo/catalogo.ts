import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo {
  links = [
    { path: '/Catalogo/Cendis', label: 'Cendis' },
    { path: '/Catalogo/Edades', label: 'Edades' },
    { path: '/Catalogo/Horarios', label: 'Horarios' },
    { path: '/Catalogo/Presentaciones', label: 'Presentaciones' },
    { path: '/Catalogo/Unidades', label: 'Unidades' }
  ];
}

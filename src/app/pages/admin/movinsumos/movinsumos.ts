import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { MovinsumosCrud } from '../../../services/cruds/admin/movinsumos-crud';

@Component({
  selector: 'app-movinsumos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movinsumos.html',
  styleUrl: './movinsumos.css'
})
export class Movinsumos {
  cendis: any[] = [];
  movimientos: any[] = [];
  selectedCendiId?: number;
  selectedCendiLabel = '';
  dropdownOpen = false;
  loading = false;
  errorMsg = '';
  currentPage = 1;
  pageSize = 100;

  constructor(private cendisCrud: CendisCrud, private movinsumosCrud: MovinsumosCrud) {}

  // Carga inicial de Cendis
  ngOnInit() {
    this.cendisCrud.getCendisAccesos().subscribe({
      next: (res: any) => {
        this.cendis = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la lista de Cendis.';
      }
    });
  }

  // Maneja el cambio del Cendi seleccionado
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Maneja la selección de un Cendi en el dropdown
  selectCendi(cendi: any) {
    this.dropdownOpen = false;
    this.selectedCendiLabel = cendi.NOM_CENDI;
    this.selectedCendiId = Number(cendi.ID);
    this.currentPage = 1; // reinicia a la primera página al cambiar cendi
    this.fetchMovimientos(this.selectedCendiId);
  }

  // Carga movimientos para un Cendi específico
  private fetchMovimientos(id_cendis: number | undefined) {
    if (!id_cendis) { this.movimientos = []; return; }
    this.loading = true;
    this.errorMsg = '';
    this.movinsumosCrud.getMovInsumos(id_cendis, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.movimientos = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error al cargar movimientos del Cendi seleccionado.';
      }
    });
  }

  // Navega a la siguiente página
  nextPage() {
    if (!this.selectedCendiId || this.loading) return;
    this.currentPage += 1;
    this.fetchMovimientos(this.selectedCendiId);
  }
}

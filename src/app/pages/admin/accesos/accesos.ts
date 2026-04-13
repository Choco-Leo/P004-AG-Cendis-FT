import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { AccesosCrud } from '../../../services/cruds/admin/accesos-crud';

@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesos.html',
  styleUrl: './accesos.css'
})
export class Accesos {
  menuItems = [
    { id: 'create', title: 'Crear Acceso', active: true },
    { id: 'edit', title: 'Editar Acceso', active: false },
    { id: 'delete', title: 'Eliminar Acceso', active: false }
  ];

  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
  }

  cendis: any[] = [];
  accesos: any[] = [];
  selectedCendiId?: number;
  selectedCendiLabel = '';
  dropdownOpen = false;
  loading = false;
  errorMsg = '';
  currentPage = 1;
  pageSize = 100;

  constructor(private cendisCrud: CendisCrud, private accesosCrud: AccesosCrud) {}

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
  onCendiChange(idStr: string) {
    const id = Number(idStr);
    if (!id) {
      this.selectedCendiId = undefined;
      this.accesos = [];
      return;
    }
    this.selectedCendiId = id;
    this.fetchAccesos(id);
  }
  // Consulta accesos por Cendi
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  // Maneja la selección de un Cendi en el dropdown
  selectCendi(cendi: any) {
    this.dropdownOpen = false;
    this.selectedCendiLabel = cendi.NOM_CENDI;
    this.selectedCendiId = Number(cendi.ID);
    this.currentPage = 1; // reinicia a la primera página al cambiar cendi
    this.fetchAccesos(this.selectedCendiId);
  }
  // Carga accesos para un Cendi específico
  private fetchAccesos(id_cendis: number | undefined) {
    if (!id_cendis) { this.accesos = []; return; }
    this.loading = true;
    this.errorMsg = '';
    this.accesosCrud.getAccesos(id_cendis, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.accesos = Array.isArray(res) ? res : (res?.data ?? []);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error al cargar accesos del Cendi seleccionado.';
      }
    });
  }
  // Navega a la siguiente página de accesos
  nextPage() {
    if (!this.selectedCendiId || this.loading) return;
    this.currentPage += 1;
    this.fetchAccesos(this.selectedCendiId);
  }
}

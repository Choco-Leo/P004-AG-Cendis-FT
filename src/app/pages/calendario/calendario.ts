import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CalendarioCrud } from '../../services/cruds/calendario/calendario-crud';
import { MenusCrud } from '../../services/cruds/cocina/menus-crud';
import { CendisCrud } from '../../services/cruds/catalogo/cendis-crud';
import { AlertService } from '../../services/alert';
import { ErrorHandlerService } from '../../services/error-handler';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario implements OnInit {
  calendarioForm: FormGroup;
  viewDate: string | null = null;
  calendarioData: any[] = [];
  cendis: any[] = [];
  menus: any[] = [];
  hasExistingForDate = false;
  globalMenuId: any = '';

  constructor(
    private fb: FormBuilder,
    private calendarioCrud: CalendarioCrud,
    private menusCrud: MenusCrud,
    private cendisCrud: CendisCrud,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService
  ) {
    this.calendarioForm = this.fb.group({
      fch: ['', Validators.required],
      detalles: [[]]
    });
  }

  ngOnInit() {
    const today = this.getTodayStr();
    this.setFecha(today);
    this.loadCendis();
    this.loadMenus();
  }

  private getTodayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getDetalles() {
    return this.calendarioForm.get('detalles')?.value || [];
  }

  setFecha(date: string) {
    this.calendarioForm.patchValue({ fch: date });
    this.viewDate = date;
    this.loadCalendario();
  }

  syncDetallesWithFecha(date: string) {
    const existentes = this.calendarioData.filter(d => d.FCH === date);
    this.hasExistingForDate = existentes.length > 0;
    this.globalMenuId = '';

    const mapa = new Map<number, number>();
    for (const d of existentes) {
      mapa.set(d.ID_CENDIS, d.ID_MENUS);
    }
    const detalles = Array.from(mapa.entries()).map(([id_cendis, id_menus]) => ({
      id_cendis,
      id_menus
    }));
    this.calendarioForm.patchValue({ detalles });
  }

  loadCendis() {
    this.cendisCrud.getCendis().subscribe({
      next: (res: any) => this.cendis = res.success ? res.data : [],
      error: (err) => console.error('Error cargando cendis', err)
    });
  }

  loadMenus() {
    this.menusCrud.getMenus().subscribe({
      next: (res: any) => this.menus = res.success ? res.data : [],
      error: (err) => console.error('Error cargando menus', err)
    });
  }

  loadCalendario() {
    const fch = this.viewDate || this.getTodayStr();
    this.calendarioCrud.getCalendario(fch).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.calendarioData = (res.data || []).map((d: any) => ({
            ...d,
            FCH: d.FCH ? new Date(d.FCH).toISOString().slice(0, 10) : d.FCH
          }));
          if (this.viewDate) {
            this.syncDetallesWithFecha(this.viewDate);
          }
        } else {
          this.errorHandler.handleError(res, 'Error al cargar calendario');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar calendario')
    });
  }

  getSelectedMenuId(cendiId: number) {
    const detalles = this.getDetalles();
    const encontrado = detalles.find((d: any) => d.id_cendis === cendiId);
    return encontrado ? encontrado.id_menus : '';
  }

  onChangeMenu(cendiId: number, menuId: any) {
    const detalles = this.getDetalles();
    const index = detalles.findIndex((d: any) => d.id_cendis === cendiId);
    const id_menus = menuId ? Number(menuId) : null;

    if (!id_menus) {
      if (index !== -1) {
        detalles.splice(index, 1);
      }
    } else {
      if (index === -1) {
        detalles.push({ id_cendis: cendiId, id_menus });
      } else {
        detalles[index].id_menus = id_menus;
      }
    }

    this.calendarioForm.patchValue({ detalles });
  }

  onChangeGlobalMenu(menuId: any) {
    const id_menus = menuId ? Number(menuId) : null;
    this.globalMenuId = id_menus ?? '';

    if (!id_menus) {
      return;
    }

    const detalles = this.getDetalles();

    this.cendis.forEach((cendi: any) => {
      const index = detalles.findIndex((d: any) => d.id_cendis === cendi.ID);
      if (index === -1) {
        detalles.push({ id_cendis: cendi.ID, id_menus });
      } else {
        detalles[index].id_menus = id_menus;
      }
    });

    this.calendarioForm.patchValue({ detalles });
  }

  onSubmitCreate() {
    if (this.calendarioForm.invalid) return;
    const payload = this.calendarioForm.value;

    console.log('Calendario CREATE payload:', payload);

    this.calendarioCrud.createCalendario(payload).subscribe({
      next: (res: any) => {
        console.log('Calendario CREATE response:', res);
        if (res.success) {
          this.alert.show('Calendario creado exitosamente', 'success');
          this.loadCalendario();
        } else {
          this.errorHandler.handleError(res, 'Error al crear calendario');
        }
      },
      error: (err) => {
        console.error('Calendario CREATE HTTP error:', err);
        this.errorHandler.handleHttpError(err, 'Error al crear calendario');
      }
    });
  }

  onSubmitUpdate() {
    if (this.calendarioForm.invalid) return;
    const payload = this.calendarioForm.value;

    console.log('Calendario UPDATE payload:', payload);

    this.calendarioCrud.updateCalendario(payload).subscribe({
      next: (res: any) => {
        console.log('Calendario UPDATE response:', res);
        if (res.success) {
          this.alert.show('Calendario actualizado exitosamente', 'success');
          this.loadCalendario();
        } else {
          this.errorHandler.handleError(res, 'Error al actualizar calendario');
        }
      },
      error: (err) => {
        console.error('Calendario UPDATE HTTP error:', err);
        this.errorHandler.handleHttpError(err, 'Error al actualizar calendario');
      }
    });
  }
}

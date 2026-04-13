import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { AlminsumosCrud } from '../../../services/cruds/cocina/alminsumos-crud';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { AuthService } from '../../../services/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-alminsumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alminsumos.html',
  styleUrl: './alminsumos.css'
})
export class Alminsumos implements OnInit {
  editForm: FormGroup;

  insumos: any[] = [];
  cendis: any[] = [];
  selectedCendisId: number | null = null;
  isAdmin: boolean = false;
  selectedInsumoCurrentQuantity: number = 0;

  menuItems = [
    { id: 'list', title: 'Consultar Almacen', active: true },
    { id: 'edit', title: 'Actualizacion Manual', active: false }
  ];

  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService,
    private alminsumosCrud: AlminsumosCrud,
    private cendisCrud: CendisCrud,
  ) {
    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_insumo: [{ value: '', disabled: true }],
      unidad: [{ value: '', disabled: true }],
      presentacion: [{ value: '', disabled: true }],
      cantidad_agregar: [null, [Validators.min(0)]],
      cantidad_restar: [null, [Validators.min(0)]]
    });
  }
  // Método para activar un ítem del menú
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    this.loadAlmInsumos();
    if (selectedItem.id === 'edit') {
      this.editForm.reset();
    }
  }
  // Método para cargar cendis
  loadCendis() {
    this.cendisCrud.getCendis().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cendis = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar Cendis');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar Cendis')
    });
  }
  // Método para inicializar la página
  ngOnInit() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.id_cargos === 1;
      if (this.isAdmin) {
        this.loadCendis();
      }
      this.loadAlmInsumos();
    });
  }
  // Método para cargar insumos
  loadAlmInsumos() {
    const cendiId = this.selectedCendisId ?? undefined;
    
    this.alminsumosCrud.getAlmInsumos(cendiId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.insumos = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar insumos');
        }
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'Error al cargar insumos');
      }
    });
  }
  // Método para manejar cambios en el selector de cendis
  onCendiChange(event: any) {
    const value = event.target.value;
    this.selectedCendisId = value && value !== 'null' ? Number(value) : null;
    this.loadAlmInsumos();
  }
  // Método para establecer el insumo a actualizar en el formulario
  setInsumoToUpdate(row: any) {
    this.selectedInsumoCurrentQuantity = row.CANTIDAD;
    this.editForm.patchValue({
      id: row.ID,
      nom_insumo: row.INSUMO,
      unidad: row.UNIDAD,
      presentacion: row.PRESENTACION,
      cantidad_agregar: null,
      cantidad_restar: null
    });
  }

  onSubmitEdit() {
    // Validar que al menos uno de los campos tenga valor si es necesario, o simplemente permitir guardar
    if (!this.editForm.get('id')?.value) return;
    
    const raw = this.editForm.getRawValue();
    const agregar = Number(raw.cantidad_agregar || 0);
    const restar = Number(raw.cantidad_restar || 0);
    
    if (agregar === 0 && restar === 0) {
       this.alert.show('Ingrese una cantidad para agregar o restar', 'error');
       return;
    }

    const newQuantity = Number(this.selectedInsumoCurrentQuantity) + agregar - restar;
    
    if (newQuantity < 0) {
      this.alert.show('La cantidad final no puede ser menor a 0', 'error');
      return;
    }

    const formData = { 
      id: raw.id,
      cantidad: newQuantity
    };
    
    this.alminsumosCrud.editAlmInsumo(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Insumo actualizado exitosamente', 'success');
          this.editForm.reset();
          this.selectedInsumoCurrentQuantity = 0;
          this.loadAlmInsumos();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar insumo');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar insumo')
    });
  }

}

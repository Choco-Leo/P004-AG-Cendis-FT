import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { CatinsumosCrud } from '../../../services/cruds/cocina/catinsumos-crud';
import { UnidadesCrud } from '../../../services/cruds/catalogo/unidades-crud';
import { PresentacionesCrud } from '../../../services/cruds/catalogo/presentaciones-crud';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { AuthService } from '../../../services/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-catinsumos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catinsumos.html',
  styleUrl: './catinsumos.css'
})
export class Catinsumos implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  insumos: any[] = [];
  unidades: any[] = [];
  presentaciones: any[] = [];
  cendis: any[] = [];
  selectedCendisId: number | null = null;
  isAdmin: boolean = false;

  menuItems = [
    { id: 'list', title: 'Listar Insumos', active: true },
    { id: 'create', title: 'Crear Insumo', active: false },
    { id: 'edit', title: 'Editar Insumo', active: false },
    { id: 'delete', title: 'Eliminar Insumo', active: false }
  ];

  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService,
    private catinsumosCrud: CatinsumosCrud,
    private unidadesCrud: UnidadesCrud,
    private presentacionesCrud: PresentacionesCrud,
    private cendisCrud: CendisCrud,
  ) {
    this.createForm = this.fb.group({
      nom_insumo: ['', [Validators.required, Validators.maxLength(200)]],
      contenido: [null, [Validators.required, Validators.min(0.01)]],
      id_unidades: [null, Validators.required],
      id_presentaciones: [null, Validators.required],
      categoria: ['', [Validators.required, Validators.maxLength(200)]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_insumo: ['', [Validators.required, Validators.maxLength(200)]],
      contenido: [null, [Validators.required, Validators.min(0.01)]],
      id_unidades: [null, Validators.required],
      id_presentaciones: [null, Validators.required],
      categoria: ['', [Validators.required, Validators.maxLength(200)]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      activo: [true]
    });

    this.deleteForm = this.fb.group({
      id: ['', Validators.required]
    });
  }

  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    this.loadCatInsumos();
    if (selectedItem.id === 'create') {
      this.createForm.reset({ id_unidades: null, id_presentaciones: null, activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id_unidades: null, id_presentaciones: null, activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  // Método para cargar unidades
  loadUnidades() {
    this.unidadesCrud.getUnidades().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.unidades = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar unidades');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar unidades')
    });
  }
  // Método para cargar presentaciones
  loadPresentaciones() {
    this.presentacionesCrud.getPresentaciones().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.presentaciones = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar presentaciones');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar presentaciones')
    });
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
  // Método para inicializar la página (SI ES ADMIN CARGA CIERTAS OPCIONES)
  ngOnInit() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.id_cargos === 1;
      if (this.isAdmin) {
        this.loadCendis();
      }
      this.loadUnidades();
      this.loadPresentaciones();
      this.loadCatInsumos();
    });
  }
  // Método para cargar insumos
  loadCatInsumos() {
    this.catinsumosCrud.getCatInsumos().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.insumos = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar insumos');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar insumos')
    });
  }

  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    const formData = { ...raw, activo: raw.activo ? 1 : 0 };
    this.catinsumosCrud.createCatInsumo(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Insumo creado exitosamente', 'success');
          this.createForm.reset({ id_unidades: null, id_presentaciones: null, activo: true });
          this.loadCatInsumos();
        } else {
          this.errorHandler.handleError(response, 'Error al crear insumo');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear insumo')
    });
  }

  setInsumoToUpdate(row: any) {
    this.editForm.patchValue({
      id: row.ID,
      nom_insumo: row.NOM_INSUMO,
      contenido: row.CONTENIDO,
      id_unidades: this.unidades.find(u => u.NOM_UNIDAD === row.UNIDAD)?.ID ?? null,
      id_presentaciones: this.presentaciones.find(p => p.NOM_PRESENTACION === row.PRESENTACION)?.ID ?? null,
      categoria: row.CATEGORIA,
      precio: row.PRECIO,
      activo: row.ACTIVO
    });
  }

  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    const formData = { ...raw, activo: raw.activo ? 1 : 0 };
    this.catinsumosCrud.editCatInsumo(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Insumo actualizado exitosamente', 'success');
          this.editForm.reset({ id_unidades: null, id_presentaciones: null, activo: true });
          this.loadCatInsumos();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar insumo');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar insumo')
    });
  }

  setInsumoToDelete(row: any) {
    this.deleteForm.patchValue({ id: row.ID });
  }

  onSubmitDelete() {
    if (!this.deleteForm.valid) return;
    const id = Number(this.deleteForm.get('id')?.value);
    this.catinsumosCrud.deleteCatInsumo(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Insumo eliminado exitosamente', 'success');
          this.deleteForm.reset();
          this.loadCatInsumos();
        } else {
          this.errorHandler.handleError(response, 'Error al eliminar insumo');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar insumo')
    });
  }
}

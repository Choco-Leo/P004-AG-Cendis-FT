import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { UnidadesCrud } from '../../../services/cruds/catalogo/unidades-crud';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unidades.html',
  styleUrl: './unidades.css'
})
export class Unidades implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  unidades: any[] = [];

  menuItems = [
    { id: 'list', title: 'Listar Unidades', active: true },
    { id: 'create', title: 'Crear Unidad', active: false },
    { id: 'edit', title: 'Editar Unidad', active: false },
    { id: 'delete', title: 'Eliminar Unidad', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private unidadesCrud: UnidadesCrud,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nom_unidad: ['', Validators.required],
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_unidad: ['', Validators.required],
      activo: [true]
    });

    this.deleteForm = this.fb.group({
      id: ['', Validators.required]
    });
  }

  //Metodo para establecer el item activo en el menu
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    if (selectedItem.id === 'create') {
      this.createForm.reset({ nom_unidad: '', activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id: '', nom_unidad: '', activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  //Metodo para llamar a la lista de unidades
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
  //Metodo para llamar a la lista de unidades al inicializar el componente
  ngOnInit() {
    this.loadUnidades();
  }
  //Metodo para crear una unidad
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    const formData = {
      nom_unidad: raw.nom_unidad,
      activo: raw.activo ? 1 : 0
    };
    this.unidadesCrud.createUnidades(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Unidad creada exitosamente', 'success');
          this.createForm.reset({ nom_unidad: '', activo: true });
          this.loadUnidades();
        } else {
          this.errorHandler.handleError(response, 'Error al crear unidad');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear unidad')
    });
  }
  //Metodo para establecer la unidad a editar en el formulario
  setUnidadToUpdate(u: any) {
    this.editForm.patchValue({
      id: u.ID,
      nom_unidad: u.NOM_UNIDAD,
      activo: u.ACTIVO == 1
    });
  }
  //Metodo para actualizar una unidad
  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    const formData = {
      id: Number(raw.id),
      nom_unidad: raw.nom_unidad,
      activo: raw.activo ? 1 : 0
    };
    this.unidadesCrud.updateUnidades(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Unidad actualizada exitosamente', 'success');
          this.editForm.reset({ id: '', nom_unidad: '', activo: true });
          this.loadUnidades();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar unidad');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar unidad')
    });
  }
  //Metodo para establecer la unidad a eliminar en el formulario
  setUnidadToDelete(u: any) {
    this.deleteForm.patchValue({ id: u.ID });
  }
  //Metodo para eliminar una unidad
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid || !id) return;

    if (confirm('¿Estás seguro de eliminar esta unidad?')) {
      this.unidadesCrud.deleteUnidades(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Unidad eliminada exitosamente', 'success');
            this.deleteForm.reset();
            this.loadUnidades();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar unidad');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar unidad')
      });
    }
  }
}
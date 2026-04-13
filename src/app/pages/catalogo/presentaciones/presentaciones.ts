import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { PresentacionesCrud } from '../../../services/cruds/catalogo/presentaciones-crud';

@Component({
  selector: 'app-presentaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './presentaciones.html',
  styleUrl: './presentaciones.css'
})
export class Presentaciones implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  presentaciones: any[] = [];

  menuItems = [
    { id: 'list', title: 'Listar Presentaciones', active: true },
    { id: 'create', title: 'Crear Presentación', active: false },
    { id: 'edit', title: 'Editar Presentación', active: false },
    { id: 'delete', title: 'Eliminar Presentación', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private presentacionesCrud: PresentacionesCrud,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nom_presentacion: ['', Validators.required],
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_presentacion: ['', Validators.required],
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
      this.createForm.reset({ nom_presentacion: '', activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id: '', nom_presentacion: '', activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  //Metodo para cargar las presentaciones
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
  //Metodo para cargar las presentaciones al inicializar el componente
  ngOnInit() {
    this.loadPresentaciones();
  }
  //Metodo para crear una presentacion
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    const formData = {
      nom_presentacion: raw.nom_presentacion,
      activo: raw.activo ? 1 : 0
    };
    this.presentacionesCrud.createPresentaciones(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Presentación creada exitosamente', 'success');
          this.createForm.reset({ nom_presentacion: '', activo: true });
          this.loadPresentaciones();
        } else {
          this.errorHandler.handleError(response, 'Error al crear presentación');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear presentación')
    });
  }
  //Metodo para establecer la presentacion a actualizar en el formulario
  setPresentacionToUpdate(p: any) {
    this.editForm.patchValue({
      id: p.ID,
      nom_presentacion: p.NOM_PRESENTACION,
      activo: p.ACTIVO == 1
    });
  }
  //Metodo para actualizar una presentacion
  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    const formData = {
      id: Number(raw.id),
      nom_presentacion: raw.nom_presentacion,
      activo: raw.activo ? 1 : 0
    };
    this.presentacionesCrud.updatePresentaciones(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Presentación actualizada exitosamente', 'success');
          this.editForm.reset({ id: '', nom_presentacion: '', activo: true });
          this.loadPresentaciones();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar presentación');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar presentación')
    });
  }
  //Metodo para establecer la presentacion a eliminar en el formulario
  setPresentacionToDelete(p: any) {
    this.deleteForm.patchValue({ id: p.ID });
  }
  //Metodo para eliminar una presentacion
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid || !id) return;
    if (confirm('¿Estás seguro de eliminar esta presentación?')){
      this.presentacionesCrud.deletePresentaciones(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Presentación eliminada exitosamente', 'success');
          this.deleteForm.reset();
          this.loadPresentaciones();
        } else {
          this.errorHandler.handleError(response, 'Error al eliminar presentación');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar presentación')
    });
    }
  }
}

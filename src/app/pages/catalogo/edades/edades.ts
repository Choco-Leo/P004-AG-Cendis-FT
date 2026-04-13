import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EdadesCrud } from '../../../services/cruds/catalogo/edades-crud';
import { ErrorHandlerService } from '../../../services/error-handler';
import { AlertService } from '../../../services/alert';

@Component({
  selector: 'app-edades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edades.html',
  styleUrl: './edades.css'
})
export class Edades implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  edades: any[] = [];

  menuItems = [
    { id: 'list', title: 'Listar Rangos de Edad', active: true },
    { id: 'create', title: 'Crear Rango de Edad', active: false },
    { id: 'edit', title: 'Editar Rango de Edad', active: false },
    { id: 'delete', title: 'Eliminar Rango de Edad', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private edadesCrud: EdadesCrud,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nom_rango_edad: ['', Validators.required],
      edadmin_meses: [null, [Validators.required, Validators.min(0)]],
      edadmax_meses: [null, [Validators.required, Validators.min(1)]],
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_rango_edad: ['', Validators.required],
      edadmin_meses: [null, [Validators.required, Validators.min(0)]],
      edadmax_meses: [null, [Validators.required, Validators.min(1)]],
      activo: [true]
    });

    this.deleteForm = this.fb.group({
      id: ['', Validators.required]
    });
  }

  //Metodo para activar el item seleccionado en el menu lateral
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    if (selectedItem.id === 'create') {
      this.createForm.reset({ nom_rango_edad: '', edadmin_meses: null, edadmax_meses: null, activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id: '', nom_rango_edad: '', edadmin_meses: null, edadmax_meses: null, activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  //Metodo para llamar a la lista de edades 
  loadEdades() {
    this.edadesCrud.getEdades().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.edades = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar rangos de edad');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar rangos de edad')
    });
  }
  //Metodo para llamar a la lista de edades cuando se inicializa el componente
  ngOnInit() {
    this.loadEdades();
  }
  //Metodo para crear un rango de edad
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    if (Number(raw.edadmin_meses) >= Number(raw.edadmax_meses)) {
      this.alert.show('La edad mínima debe ser menor que la edad máxima.', 'warning');
      return;
    }
    const formData = {
      nom_rango_edad: raw.nom_rango_edad,
      edadmin_meses: Number(raw.edadmin_meses),
      edadmax_meses: Number(raw.edadmax_meses),
      activo: raw.activo ? 1 : 0
    };
    this.edadesCrud.createEdad(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Rango de edad creado exitosamente', 'success');
          this.createForm.reset({ nom_rango_edad: '', edadmin_meses: null, edadmax_meses: null, activo: true });
          this.loadEdades();
        } else {
          this.errorHandler.handleError(response, 'Error al crear rango de edad');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear rango de edad')
    });
  }
  //Metodo para establecer el rango de edad a actualizar en el formulario
  setEdadToUpdate(e: any) {
    this.editForm.patchValue({
      id: e.ID,
      nom_rango_edad: e.NOM_RANGO_EDAD,
      edadmin_meses: e.EDADMIN_MESES,
      edadmax_meses: e.EDADMAX_MESES,
      activo: e.ACTIVO == 1
    });
  }
  //Metodo para actualizar un rango de edad
  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    if (Number(raw.edadmin_meses) >= Number(raw.edadmax_meses)) {
      this.alert.show('La edad mínima debe ser menor que la edad máxima.', 'warning');
      return;
    }
    const formData = {
      id: Number(raw.id),
      nom_rango_edad: raw.nom_rango_edad,
      edadmin_meses: Number(raw.edadmin_meses),
      edadmax_meses: Number(raw.edadmax_meses),
      activo: raw.activo ? 1 : 0
    };
    this.edadesCrud.updateEdad(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Rango de edad actualizado exitosamente', 'success');
          this.editForm.reset({ id: '', nom_rango_edad: '', edadmin_meses: null, edadmax_meses: null, activo: true });
          this.loadEdades();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar rango de edad');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar rango de edad')
    });
  }
  //Metodo para establecer el rango de edad a eliminar en el formulario
  setEdadToDelete(e: any) {
    this.deleteForm.patchValue({ id: e.ID });
  }
  //Metodo para eliminar un rango de edad
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid || !id) return;

    if(confirm('¿Estás seguro de que deseas eliminar este Rango de Edad?')) {
      this.edadesCrud.deleteEdad(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Rango de edad eliminado exitosamente', 'success');
            this.deleteForm.reset();
            this.loadEdades();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar rango de edad');
          }
        },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar rango de edad')
    });
    }
  }
}

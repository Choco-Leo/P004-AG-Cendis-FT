import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';

@Component({
  selector: 'app-cendis',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './cendis.html',
  styleUrl: './cendis.css'
})
export class Cendis implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;
  cendis: any[] = [];
  
  menuItems = [
    { id: 'list', title: 'Listar Cendis', active: true },
    { id: 'create', title: 'Crear Cendi', active: false },
    { id: 'edit', title: 'Editar Cendi', active: false },
    { id: 'delete', title: 'Eliminar Cendi', active: false }
  ];

    constructor(
    private fb: FormBuilder,
    private cendisCrud: CendisCrud,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nom_cendi: ['', Validators.required],
      activo: [true]
    });
    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_cendi: ['', Validators.required],
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
      this.createForm.reset({ nom_cendi: '', activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id: '', nom_cendi: '', activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  //Metodo para llamar a la lista de cargos
  loadCendis(){
        this.cendisCrud.getCendis().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cendis = response.data;
        } else {
          this.errorHandler.handleError(response, 'Error al cargar cendis');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar cendis')
    });
  }
  //Metodo para llamar a la lista de cargos cuando se inicializa el componente
  ngOnInit(): void {
    this.loadCendis();
  }
  //Metodo para crear un cendi
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    const formData = { nom_cendi: raw.nom_cendi, activo: raw.activo ? 1 : 0 };
    this.cendisCrud.createCendis(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Cendi creado exitosamente', 'success');
          this.createForm.reset({ nom_cendi: '', activo: true });
          this.loadCendis(); // Recargar la lista
        } else {
          this.errorHandler.handleError(response, 'Error al crear cendi');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear cendi')
    });
  }
  //Metodo para establecer el cendi a actualizar en el formulario
  setCendiToUpdate(cendi: any) {
    this.editForm.patchValue({
      id: cendi.ID,
      nom_cendi: cendi.NOM_CENDI,
      activo: cendi.ACTIVO == 1
    });
  }
  //Metodo para actualizar un cendi
  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    const formData = { id: Number(raw.id), nom_cendi: raw.nom_cendi, activo: raw.activo ? 1 : 0 };
    this.cendisCrud.updateCendis(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Cendi actualizado exitosamente', 'success');
          this.editForm.reset({ id: '', nom_cendi: '', activo: true });
          this.loadCendis();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar cendi');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar cendi')
    });
  }
  //Metodo para establecer el cendi a eliminar en el formulario
  setCendiToDelete(cendi: any) {
    this.deleteForm.patchValue({ id: cendi.ID });
  }
  //Metodo para eliminar un cendi 
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid || !id) return;

    if(confirm('¿Estás seguro de que deseas eliminar este Cendi?')) {
      this.cendisCrud.deleteCendis(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Cendi eliminado exitosamente', 'success');
            this.deleteForm.reset();
            this.loadCendis();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar cendi');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar cendi')
      });
    }
  }
}

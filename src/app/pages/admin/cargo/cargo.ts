import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CargosCrud } from '../../../services/cruds/admin/cargos-crud';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { PermisosCrud } from '../../../services/cruds/admin/permisos-crud';
import { CargosPermisosCrud } from '../../../services/cruds/admin/cargos-permisos-crud';

@Component({
  selector: 'app-cargo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cargo.html',
  styleUrl: './cargo.css'
})

export class Cargo implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;
  
  cargos: any[] = [];

  menuItems = [
    { id: 'permisos', title: 'Asignar Permisos', active: true },
    { id: 'create', title: 'Crear Cargo', active: false },
    { id: 'edit', title: 'Editar Cargo', active: false },
    { id: 'delete', title: 'Eliminar Cargo', active: false }
  ];

  permisosAsignados: any[] = [];
  permisosNoAsignados: any[] = [];
  // arrays de selección
  selectedPermisosAsignadosIds: number[] = [];
  selectedPermisosNoAsignadosIds: number[] = [];
  selectedCargoForPermisos: number | null = null;
  permisosLoading = false;
  permisosError = '';
  permisosModalOpen = false;
  selectedPermisosIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private cargosCrud: CargosCrud,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService,
    private permisosCrud: PermisosCrud,
    private cargosPermisosCrud: CargosPermisosCrud
  ) {
    this.createForm = this.fb.group({
      nom_cargo: ['', Validators.required],
      activo: [true]
    });
    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_cargo: ['', Validators.required],
      activo: [true]
    });
    this.deleteForm = this.fb.group({
      id: ['', Validators.required]
    });
  }
  //Metodo para llamar a la lista de cargos cuando se inicializa el componente
  ngOnInit() {
    this.loadCargos();
  }
  //Metodo para activar el item seleccionado en el menu lateral
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    if (selectedItem.id === 'create') {
      this.createForm.reset({ activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    } else if (selectedItem.id === 'permisos' && this.selectedCargoForPermisos) {
      // Recargar permisos si ya hay un cargo seleccionado
      this.setPermisosAsignados(this.selectedCargoForPermisos);
    }
  }
  //Metodo para llamar a la lista de cargos
  loadCargos() {
    this.cargosCrud.getCargos().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cargos = response.data;
        } else {
          this.errorHandler.handleError(response, 'Error al cargar cargos');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar cargos')
    });
  }
  //Metodo para crear un cargo
  onSubmitCreate() {
    if (this.createForm.valid) {
      const raw = this.createForm.value;
      const formData = { ...raw, activo: raw.activo ? 1 : 0 };
      this.cargosCrud.createCargos(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Cargo creado exitosamente', 'success');
            this.createForm.reset({ activo: true });
            this.loadCargos();
          } else {
            this.errorHandler.handleError(response, 'Error al crear cargo');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear cargo')
      });
    }
  }
  //Metodo para activar el item editar en el menu
  setCargoToUpdate(cargo: any) {
    this.editForm.patchValue({
      id: cargo.ID,
      nom_cargo: cargo.NOM_CARGO,
      activo: cargo.ACTIVO ?? true
    });
  }
  //Metodo para editar un cargo
  onSubmitEdit() {
    const id = Number(this.editForm.get('id')?.value);
    if (id === 1) {
      this.alert.show('El Registro 1 Es El Administrador, No Puede Ser Modificado.', 'warning');
      return; // cancela la solicitud
    }

    if (this.editForm.valid) {
      const raw = this.editForm.value;
      const formData = { ...raw, activo: raw.activo ? 1 : 0 };
      this.cargosCrud.updateCargos(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Cargo actualizado exitosamente', 'success');
            this.editForm.reset({ activo: true });
            this.loadCargos();
          } else {
            this.errorHandler.handleError(response, 'Error al actualizar cargo');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar cargo')
      });
    }
  }
  //Metodo para activar el item eliminar en el menu
  setCargoToDelete(cargo: any) {
    this.deleteForm.patchValue({
      id: cargo.ID
    });
  }
  //Metodo para eliminar un cargo
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (id === 1) {
      this.alert.show('El Registro 1 Es El Administrador, No Puede Ser Eliminado.', 'warning');
      return; // cancela la solicitud
    }

    if (this.deleteForm.valid) {
      this.cargosCrud.deleteCargos(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Cargo eliminado exitosamente', 'success');
            this.deleteForm.reset();
            this.loadCargos();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar cargo');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar cargo')
      });
    }
  }
  //////////////////////////////////////////
  //Metodo para establecer los permisos asignados y no asignados para un cargo
  setPermisosAsignados(id_cargos: number) {
    this.selectedCargoForPermisos = id_cargos;
    this.selectedPermisosAsignadosIds = [];
    this.selectedPermisosNoAsignadosIds = [];

    if (!id_cargos) {
      this.permisosAsignados = [];
      this.permisosNoAsignados = [];
      this.selectedCargoForPermisos = null;
      return;
    }

    this.loadPermisosAS(id_cargos);
    this.loadPermisosNoAsignados(id_cargos);
  }
  //Metodo para llamar a la lista de permisos asignados para un cargo
  loadPermisosAS(id_cargos: number) {
    this.permisosCrud.getPermisosAsignados(id_cargos).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.permisosAsignados = response.data;
        } else {
          this.permisosAsignados = [];
          this.errorHandler.handleError(response, 'Error al cargar permisos asignados');
        }
      },
      error: (err) => {
        this.permisosAsignados = [];
        this.errorHandler.handleHttpError(err, 'Error al cargar permisos asignados');
      }
    });
  }
  //Metodo para llamar a la lista de permisos no asignados para un cargo
  loadPermisosNoAsignados(id_cargos: number) {
    this.permisosCrud.getPermisosNoAsignados(id_cargos).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.permisosNoAsignados = response.data;
        } else {
          this.permisosNoAsignados = [];
          this.errorHandler.handleError(response, 'Error al cargar permisos no asignados');
        }
      },
      error: (err) => {
        this.permisosNoAsignados = [];
        this.errorHandler.handleHttpError(err, 'Error al cargar permisos no asignados');
      }
    });
  }
  //Metodo para agregar o quitar un permiso asignado a un cargo
  toggleAsignado(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedPermisosAsignadosIds.includes(id)) {
        this.selectedPermisosAsignadosIds.push(id);
      }
    } else {
      this.selectedPermisosAsignadosIds = this.selectedPermisosAsignadosIds.filter(p => p !== id);
    }
  }
  //Metodo para seleccionar o deseleccionar todos los permisos asignados
  toggleAllAsignados(checked: boolean) {
    if (checked) {
      this.selectedPermisosAsignadosIds = this.permisosAsignados.map(p => p.ID);
    } else {
      this.selectedPermisosAsignadosIds = [];
    }
  }
  //Metodo para agregar o quitar un permiso no asignado a un cargo
  toggleNoAsignado(id: number, checked: boolean) {
    if (checked) {
      if (!this.selectedPermisosNoAsignadosIds.includes(id)) {
        this.selectedPermisosNoAsignadosIds.push(id);
      }
    } else {
      this.selectedPermisosNoAsignadosIds = this.selectedPermisosNoAsignadosIds.filter(p => p !== id);
    }
  }
  //Metodo para seleccionar o deseleccionar todos los permisos no asignados
  toggleAllNoAsignados(checked: boolean) {
    if (checked) {
      this.selectedPermisosNoAsignadosIds = this.permisosNoAsignados.map(p => p.ID);
    } else {
      this.selectedPermisosNoAsignadosIds = [];
    }
  }
  //Metodo para asignar los permisos seleccionados a un cargo
  asignarSeleccionados() {
    const idCargo = this.selectedCargoForPermisos;
    const permisos = this.selectedPermisosNoAsignadosIds;
    if (!idCargo || permisos.length === 0) return;

    this.cargosPermisosCrud.asignarPermisosACargo(idCargo, permisos, 1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Permisos asignados exitosamente', 'success');
          this.selectedPermisosNoAsignadosIds = [];
          this.loadPermisosAS(idCargo);
          this.loadPermisosNoAsignados(idCargo);
        } else {
          this.errorHandler.handleError(response, 'Error al asignar permisos');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al asignar permisos')
    });
  }
  //Metodo para quitar los permisos seleccionados de un cargo
  quitarSeleccionados() {
    const idCargo = this.selectedCargoForPermisos;
    const permisos = this.selectedPermisosAsignadosIds;
    if (!idCargo || permisos.length === 0) return;

    this.cargosPermisosCrud.eliminarPermisosDeCargo(idCargo, permisos).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Permisos eliminados exitosamente', 'success');
          this.selectedPermisosAsignadosIds = [];
          this.loadPermisosAS(idCargo);
          this.loadPermisosNoAsignados(idCargo);
        } else {
          this.errorHandler.handleError(response, 'Error al eliminar permisos');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar permisos')
    });
  }
}

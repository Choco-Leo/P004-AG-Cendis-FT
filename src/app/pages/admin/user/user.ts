import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { CargosCrud } from '../../../services/cruds/admin/cargos-crud';
import { UsersCrud } from '../../../services/cruds/admin/users-crud';
import { ErrorHandlerService } from '../../../services/error-handler';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  cendis: any[] = [];
  cargos: any[] = [];
  users: any[] = [];

  menuItems = [
    { id: 'list', title: 'Listar Usuarios', active: true },
    { id: 'create', title: 'Crear Usuario', active: false },
    { id: 'edit', title: 'Editar Usuario', active: false },
    { id: 'delete', title: 'Eliminar Usuario', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private cendisCrud: CendisCrud,
    private cargosCrud: CargosCrud,
    private usersCrud: UsersCrud,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido_p: ['', Validators.required],
      apellido_m: ['', Validators.required],
      id_cendis: [null, Validators.required],
      login_cendi: ['', Validators.required],
      password_cendi: ['', Validators.required],
      id_cargos: [null, Validators.required],
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido_p: ['', Validators.required],
      apellido_m: ['', Validators.required],
      id_cendis: [null, Validators.required],
      login_cendi: ['', Validators.required],
      password_cendi: ['', Validators.required],
      id_cargos: [null, Validators.required],
      activo: [true]
    });

    this.deleteForm = this.fb.group({
      id: ['', Validators.required]
    });
  }

  // Metodo para activar el item seleccionado en el menu
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    if (selectedItem.id === 'create') {
      this.createForm.reset({ id_cendis: null, id_cargos: null, activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id_cendis: null, id_cargos: null, activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  // Metodo para cargar los cendis disponibles
  loadCendis() {
    this.cendisCrud.getCendis().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cendis = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar cendis');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar cendis')
    });
  }
  // Metodo para cargar los cargos disponibles
  loadCargos() {
    this.cargosCrud.getCargosCU().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.cargos = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar cargos');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar cargos')
    });
  }
  // Metodo para cargar los usuarios disponibles
  loadUsers() {
    this.usersCrud.getUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users = res.data;
        } else {
          this.errorHandler.handleError(res, 'Error al cargar usuarios');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar usuarios')
    });
  }
  // Metodo para inicializar la pagina
  ngOnInit() {
    this.loadCendis();
    this.loadCargos();
    this.loadUsers();
  }
  // Metodo para manejar la creacion de un usuario
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    const formData = { ...raw, activo: raw.activo ? 1 : 0 };
    this.usersCrud.createUsers(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Usuario creado exitosamente', 'success');
          this.createForm.reset({ id_cendis: null, id_cargos: null, activo: true });
          this.loadUsers();
        } else {
          this.errorHandler.handleError(response, 'Error al crear usuario');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear usuario')
    });
  }
  // Metodo para pre-cargar los datos de un usuario en el formulario de edicion
  setUserToUpdate(user: any) {
    this.editForm.patchValue({
      id: user.ID,
      nombre: user.NOMBRE,
      apellido_p: user.APELLIDO_P,
      apellido_m: user.APELLIDO_M,
      id_cendis: this.cendis.find(c => c.NOM_CENDI === user.NOMBRE_CENDI)?.ID,
      login_cendi: user.LOGIN_CENDI,
      password_cendi: '', // Por seguridad, no pre-cargamos. El usuario puede establecer uno nuevo.
      id_cargos: this.cargos.find(c => c.NOM_CARGO === user.NOMBRE_CARGO)?.ID,
      activo: user.ACTIVO ?? true
    });
  }
  // Metodo para manejar la actualizacion de un usuario
  onSubmitEdit() {
    const id = Number(this.editForm.get('id')?.value);
    if (!this.editForm.valid) return;
    if (id === 1) {
      this.alert.show('El Registro 1 Es El Administrador, No Puede Ser Modificado.', 'warning');
      return; // cancela la solicitud
    }
    
    const raw = this.editForm.value;
    const formData = { ...raw, activo: raw.activo ? 1 : 0 };
    this.usersCrud.updateUsers(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Usuario actualizado exitosamente', 'success');
          this.editForm.reset({ id_cendis: null, id_cargos: null, activo: true });
          this.loadUsers();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar usuario');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar usuario')
    });
  }
  // Metodo para pre-cargar los datos de un usuario en el formulario de eliminacion
  setUserToDelete(user: any) {
    this.deleteForm.patchValue({ 
      id: user.ID 
    });
  }
  // Metodo para manejar la eliminacion de un usuario
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid) return;
    if (id === 1) {
      this.alert.show('El Registro 1 Es El Administrador, No Puede Ser Eliminado.', 'warning');
      return; // cancela la solicitud
    }
    
    if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.usersCrud.deleteUsers(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Usuario eliminado exitosamente', 'success');
            this.deleteForm.reset();
            this.loadUsers();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar usuario');
          }
        },
        error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar usuario')
      });
    }
  }
}
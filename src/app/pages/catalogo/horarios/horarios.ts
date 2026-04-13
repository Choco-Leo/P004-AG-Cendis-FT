import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { HorariosCrud } from '../../../services/cruds/catalogo/horarios-crud';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css'
})
export class Horarios implements OnInit {
  createForm: FormGroup;
  editForm: FormGroup;
  deleteForm: FormGroup;

  horarios: any[] = [];

  menuItems = [
    { id: 'list', title: 'Listar Horarios', active: true },
    { id: 'create', title: 'Crear Horario', active: false },
    { id: 'edit', title: 'Editar Horario', active: false },
    { id: 'delete', title: 'Eliminar Horario', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private horariosCrud: HorariosCrud,
    private errorHandler: ErrorHandlerService
  ) {
    this.createForm = this.fb.group({
      nom_horario: ['', Validators.required],
      horamin: ['', Validators.required], // HH:mm
      horamax: ['', Validators.required], // HH:mm
      activo: [true]
    });

    this.editForm = this.fb.group({
      id: ['', Validators.required],
      nom_horario: ['', Validators.required],
      horamin: ['', Validators.required],
      horamax: ['', Validators.required],
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
      this.createForm.reset({ nom_horario: '', horamin: '', horamax: '', activo: true });
    } else if (selectedItem.id === 'edit') {
      this.editForm.reset({ id: '', nom_horario: '', horamin: '', horamax: '', activo: true });
    } else if (selectedItem.id === 'delete') {
      this.deleteForm.reset();
    }
  }
  //Metodo para llamar a la lista de horarios 
  loadHorarios() {
    this.horariosCrud.getHorarios().subscribe({
      next: (res: any) => {
        if (res.success) {
          // Formatear HORAMIN/HORAMAX a HH:mm para muestreo
          this.horarios = (res.data || []).map((h: any) => ({
            ...h,
            HORAMIN: this.formatTimeToHHmm(h.HORAMIN),
            HORAMAX: this.formatTimeToHHmm(h.HORAMAX)
          }));
        } else {
          this.errorHandler.handleError(res, 'Error al cargar horarios');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar horarios')
    });
  }
  //Metodo para llamar a la lista de horarios cuando se inicializa el componente
  ngOnInit() {
    this.loadHorarios();
  }
  //Metodo para convertir una hora en formato HH:mm a minutos
  private timeToMinutes(t: string): number {
    // soporta HH:mm
    const [h, m] = t.split(':').map(n => Number(n));
    return h * 60 + m;
  }
  //Metodo para convertir minutos a formato HH:mm
  formatTimeToHHmm(value: any): string {
    if (!value) return '';
    const s = String(value);
    const parts = s.split(':');
    const hh = (parts[0] ?? '').padStart(2, '0');
    const mm = (parts[1] ?? '00').padStart(2, '0');
    return `${hh}:${mm}`;
  }
  //Metodo para crear un horario
  onSubmitCreate() {
    if (!this.createForm.valid) return;
    const raw = this.createForm.value;
    if (this.timeToMinutes(raw.horamin) >= this.timeToMinutes(raw.horamax)) {
      this.alert.show('La hora mínima debe ser menor que la hora máxima.', 'warning');
      return;
    }
    const formData = {
      nom_horario: raw.nom_horario,
      horamin: raw.horamin,
      horamax: raw.horamax,
      activo: raw.activo ? 1 : 0
    };
    this.horariosCrud.createHorarios(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Horario creado exitosamente', 'success');
          this.createForm.reset({ nom_horario: '', horamin: '', horamax: '', activo: true });
          this.loadHorarios();
        } else {
          this.errorHandler.handleError(response, 'Error al crear horario');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear horario')
    });
  }
  //Metodo para establecer el horario a actualizar en el formulario
  setHorarioToUpdate(h: any) {
    this.editForm.patchValue({
      id: h.ID,
      nom_horario: h.NOM_HORARIO,
      horamin: this.formatTimeToHHmm(h.HORAMIN),
      horamax: this.formatTimeToHHmm(h.HORAMAX),
      activo: h.ACTIVO == 1
    });
  }
  //Metodo para actualizar un horario
  onSubmitEdit() {
    if (!this.editForm.valid) return;
    const raw = this.editForm.value;
    if (this.timeToMinutes(raw.horamin) >= this.timeToMinutes(raw.horamax)) {
      this.alert.show('La hora mínima debe ser menor que la hora máxima.', 'warning');
      return;
    }
    const formData = {
      id: Number(raw.id),
      nom_horario: raw.nom_horario,
      horamin: raw.horamin,
      horamax: raw.horamax,
      activo: raw.activo ? 1 : 0
    };
    this.horariosCrud.updateHorarios(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Horario actualizado exitosamente', 'success');
          this.editForm.reset({ id: '', nom_horario: '', horamin: '', horamax: '', activo: true });
          this.loadHorarios();
        } else {
          this.errorHandler.handleError(response, 'Error al actualizar horario');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar horario')
    });
  }
  //Metodo para establecer el horario a eliminar en el formulario
  setHorarioToDelete(h: any) {
    this.deleteForm.patchValue({ id: h.ID });
  }
  //Metodo para eliminar un horario
  onSubmitDelete() {
    const id = Number(this.deleteForm.get('id')?.value);
    if (!this.deleteForm.valid || !id) return;

    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.horariosCrud.deleteHorarios(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.alert.show('Horario eliminado exitosamente', 'success');
            this.deleteForm.reset();
            this.loadHorarios();
          } else {
            this.errorHandler.handleError(response, 'Error al eliminar horario');
          }
        },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar horario')
    });
  }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';
import { PedidosCrud } from '../../../services/cruds/pedidos/pedidos-crud';
import { CendisCrud } from '../../../services/cruds/catalogo/cendis-crud';
import { EdadesCrud } from '../../../services/cruds/catalogo/edades-crud';
import { AuthService } from '../../../services/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.css'
})
export class Solicitud  implements OnInit {
  pedidoForm: FormGroup;

  cendis: any[] = [];
  rangosEdades: any[] = [];
  pedidos: any[] = [];
  pedidoSeleccionado: any | null = null;
  detallesPedido: any[] = [];
  seccionesPedido: any[] = [];
  detallesSeccionSeleccionada: any[] = [];
  seccionSeleccionadaId: number | null = null;
  pedidoCreadoId: number | null = null;
  detallesCreacion: any[] = [];
  guardandoDetalles: boolean = false;
  pedidosConsultados: boolean = false;
  isAdmin: boolean = false;
  hasMenuForDate: boolean = false;
  
  // Variables para validación de contraseña
  showPasswordModal: boolean = false;
  adminPassword: string = '';
  passwordError: string = '';
  passwordModalAction: 'guardarDetalles' | 'cancelarPedido' | null = null;
  pendingCancelPedidoId: number | null = null;

  menuItems = [
    { id: 'create', title: 'Crear Pedido', active: true },
    { id: 'consulta', title: 'Consultar Pedidos', active: false }
  ];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService,
    private pedidosCrud: PedidosCrud,
    private cendisCrud: CendisCrud,
    private authService: AuthService,
    private edadesCrud: EdadesCrud
  ) {
    this.pedidoForm = this.fb.group({
      fch: ['', Validators.required],
      id_cendis: [null],
      detallesSecciones: this.fb.array([])
    });

    // Reset hasMenuForDate when date changes
    this.pedidoForm.get('fch')?.valueChanges.subscribe(() => {
        this.hasMenuForDate = false;

    });
    
    this.pedidoForm.get('id_cendis')?.valueChanges.subscribe(() => {
        this.hasMenuForDate = false;
    });
  }

  get detallesSecciones(): FormArray {
    return this.pedidoForm.get('detallesSecciones') as FormArray;
  }

  ngOnInit() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.id_cargos === 1;
      if (this.isAdmin) {
        this.loadCendis();
      }
      this.loadRangosEdades();
    });
  }

  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
  }

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

  loadRangosEdades() {
    this.edadesCrud.getEdades().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.rangosEdades = res.data;
          this.buildDetallesFromRangos();
        } else {
          this.errorHandler.handleError(res, 'Error al cargar Rangos de Edades');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar Rangos de Edades')
    });
  }

  private buildDetallesFromRangos() {
    this.detallesSecciones.clear();
    this.rangosEdades.forEach(r => {
      this.detallesSecciones.push(this.fb.group({
        id_rango_edades: [r.ID, Validators.required],
        ninos: [null, [Validators.required, Validators.min(1)]]
      }));
    });
  }

  private resetSecciones() {
    this.detallesSecciones.controls.forEach((control, index) => {
      const rango = this.rangosEdades[index];
      if (rango) {
        control.reset({
          id_rango_edades: rango.ID,
          ninos: null
        });
      }
    });
  }

  validarMenu() {
    this.hasMenuForDate = false;
    if (!this.pedidoForm.get('fch')?.valid) return;
    const fch = this.pedidoForm.get('fch')?.value;
    const id_cendis = this.pedidoForm.get('id_cendis')?.value;

    this.pedidosCrud.validarMenu(fch, id_cendis).subscribe({
      next: (res: any) => {
        if (res.success && res.data?.existe) {
          this.hasMenuForDate = true;
          this.alert.show('Existe un menú asignado para la fecha seleccionada', 'success');
        } else if (res.success) {
          this.alert.show(res.message || 'No existe menú para la fecha seleccionada', 'error');
        } else {
          this.errorHandler.handleError(res, 'Error al validar menú');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al validar menú')
    });
  }

  consultarPedidos() {
    this.pedidosConsultados = false;
    this.pedidos = [];
    this.pedidoSeleccionado = null;
    this.detallesPedido = [];
    this.seccionesPedido = [];
    this.detallesSeccionSeleccionada = [];
    this.seccionSeleccionadaId = null;

    if (!this.pedidoForm.get('fch')?.valid) return;

    const fch = this.pedidoForm.get('fch')?.value;
    const id_cendis = this.pedidoForm.get('id_cendis')?.value;
    const idCendisToSend = this.isAdmin ? id_cendis : undefined;

    this.pedidosCrud.getPedidos(fch, idCendisToSend).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pedidos = res.data || [];
        } else {
          this.errorHandler.handleError(res, 'Error al consultar pedidos');
        }
        this.pedidosConsultados = true;
      },
      error: (err) => {
        this.errorHandler.handleHttpError(err, 'Error al consultar pedidos');
        this.pedidosConsultados = true;
      }
    });
  }

  seleccionarPedido(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.detallesPedido = [];
    this.seccionesPedido = [];
    this.detallesSeccionSeleccionada = [];
    this.seccionSeleccionadaId = null;

    const id = pedido?.ID;
    if (!id) {
      return;
    }

    this.pedidosCrud.getPedidosDetalles(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.detallesPedido = res.data || [];
        } else {
          this.errorHandler.handleError(res, 'Error al consultar detalles del pedido');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al consultar detalles del pedido')
    });

    this.pedidosCrud.getPedidosSecciones(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.seccionesPedido = res.data || [];
        } else {
          this.errorHandler.handleError(res, 'Error al consultar secciones del pedido');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al consultar secciones del pedido')
    });
  }

  seleccionarSeccion(seccion: any) {
    this.seccionSeleccionadaId = seccion?.ID || null;
    this.detallesSeccionSeleccionada = [];

    const idPedido = this.pedidoSeleccionado?.ID;
    const idSeccion = seccion?.ID;

    if (!idPedido || !idSeccion) {
      return;
    }

    this.pedidosCrud.getPedidosDetallesSecciones(idPedido, idSeccion).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.detallesSeccionSeleccionada = res.data || [];
        } else {
          this.errorHandler.handleError(res, 'Error al consultar detalle por sección');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al consultar detalle por sección')
    });
  }

  onSubmitPedido(cargarDetalles: boolean = true) {
    if (!this.pedidoForm.valid) return;

    if (!this.hasMenuForDate) {
      this.alert.show('Debe validar el menú del día antes de continuar', 'error');
      return;
    }

    const raw = this.pedidoForm.value;

    const payload: any = {
      fch: raw.fch,
      detallesSecciones: raw.detallesSecciones
    };

    if (this.isAdmin && raw.id_cendis) {
      payload.id_cendis = raw.id_cendis;
    }

    this.pedidosCrud.createPedido(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alert.show('Pedido creado exitosamente', 'success');
          const id = res.data?.id_pedido;
          this.pedidoCreadoId = id || null;
          this.detallesCreacion = [];
          
          if (cargarDetalles && id) {
            this.pedidosCrud.getPedidosDetalles(id).subscribe({
              next: (det: any) => {
                if (det.success) {
                  this.detallesCreacion = (det.data || []).map((d: any) => ({
                    ...d,
                    CANTIDAD_SUGERIDA: Number(d.CANTIDAD_SUGERIDA),
                    SUBTOTAL_TOTAL: Number(d.SUBTOTAL_TOTAL)
                  }));
                } else {
                  this.errorHandler.handleError(det, 'Error al cargar detalles del pedido creado');
                }
              },
              error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar detalles del pedido creado')
            });
            // Mantener la fecha y cendi seleccionados, pero limpiar los inputs de niños para el siguiente pedido
            this.resetSecciones();
            this.hasMenuForDate = false; 
          } else {
            // Si no carga detalles, reseteamos el formulario inmediatamente
            this.pedidoCreadoId = null;
            this.detallesCreacion = [];
            this.pedidoForm.patchValue({ fch: '', id_cendis: null });
            this.resetSecciones();
            this.hasMenuForDate = false;
          }
        } else {
          this.errorHandler.handleError(res, 'Error al crear pedido');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear pedido')
    });
  }

  actualizarCantidadSugerida(index: number, value: string) {
    const cantidad = Number(value);
    if (!this.detallesCreacion[index]) {
      return;
    }
    this.detallesCreacion[index].CANTIDAD_SUGERIDA = isNaN(cantidad) ? 0 : cantidad;
    const precio = Number(this.detallesCreacion[index].PRECIO_UNITARIO) || 0;
    this.detallesCreacion[index].SUBTOTAL_TOTAL = Number((this.detallesCreacion[index].CANTIDAD_SUGERIDA * precio).toFixed(2));
  }

  guardarCantidadesSugeridas() {
    if (!this.pedidoCreadoId || this.detallesCreacion.length === 0) {
      return;
    }

    if (!this.isAdmin) {
      this.showPasswordModal = true;
      this.adminPassword = '';
      this.passwordError = '';
      this.passwordModalAction = 'guardarDetalles';
      return;
    }

    this.procesarGuardado();
  }

  onCancelarPedido(pedido: any, event: Event) {
    event.stopPropagation();
    const idPedido = pedido?.ID;
    if (!idPedido || pedido?.CANCELADO) {
      return;
    }

    const confirmado = confirm(`¿Desea cancelar el pedido #${idPedido}?`);
    if (!confirmado) {
      return;
    }

    if (!this.isAdmin) {
      this.showPasswordModal = true;
      this.adminPassword = '';
      this.passwordError = '';
      this.passwordModalAction = 'cancelarPedido';
      this.pendingCancelPedidoId = idPedido;
      return;
    }

    this.procesarCancelacion(idPedido);
  }

  procesarGuardado(password?: string) {
    this.guardandoDetalles = true;
    this.passwordError = '';

    const detallePayload = this.detallesCreacion.map(d => ({
      id_cat_insumos: d.ID_CAT_INSUMOS,
      cantidad_sugerida: Number(d.CANTIDAD_SUGERIDA)
    }));

    this.pedidosCrud.updatePedidosDetalles(this.pedidoCreadoId!, detallePayload, password).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alert.show('Cantidades sugeridas actualizadas', 'success');
          // Resetear estado después de guardar
          this.pedidoCreadoId = null;
          this.detallesCreacion = [];
          this.pedidoForm.patchValue({ fch: '', id_cendis: null });
          this.resetSecciones();
          this.hasMenuForDate = false;
          this.showPasswordModal = false;
          this.passwordModalAction = null;
        } else {
          this.errorHandler.handleError(res, 'Error al actualizar cantidades sugeridas');
        }
        this.guardandoDetalles = false;
      },
      error: (err) => {
        if (err.status === 403 && password) {
            this.passwordError = 'Contraseña incorrecta';
        } else {
            this.errorHandler.handleHttpError(err, 'Error al actualizar cantidades sugeridas');
        }
        this.guardandoDetalles = false;
      }
    });
  }

  private procesarCancelacion(id_pedido: number, password?: string) {
    this.passwordError = '';

    this.pedidosCrud.cancelarPedido(id_pedido, true, password).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alert.show(`Pedido #${id_pedido} cancelado`, 'success');
          const encontrado = this.pedidos.find(p => p?.ID === id_pedido);
          if (encontrado) {
            encontrado.CANCELADO = true;
          }
          if (this.pedidoSeleccionado?.ID === id_pedido) {
            this.pedidoSeleccionado = { ...this.pedidoSeleccionado, CANCELADO: true };
          }
          this.showPasswordModal = false;
          this.passwordModalAction = null;
          this.pendingCancelPedidoId = null;
          this.adminPassword = '';
        } else {
          this.errorHandler.handleError(res, 'Error al cancelar pedido');
        }
      },
      error: (err) => {
        if (err.status === 403 && password) {
          this.passwordError = 'Contraseña incorrecta';
        } else {
          this.errorHandler.handleHttpError(err, 'Error al cancelar pedido');
        }
      }
    });
  }

  confirmarGuardadoConPassword() {
    if (!this.adminPassword) {
      this.passwordError = 'La contraseña es requerida';
      return;
    }
    if (this.passwordModalAction === 'cancelarPedido') {
      const idPedido = this.pendingCancelPedidoId;
      if (!idPedido) {
        this.passwordError = 'No se encontró el pedido a cancelar';
        return;
      }
      this.procesarCancelacion(idPedido, this.adminPassword);
      return;
    }

    this.procesarGuardado(this.adminPassword);
  }

  cancelarPasswordModal() {
    this.showPasswordModal = false;
    this.adminPassword = '';
    this.passwordError = '';
    this.passwordModalAction = null;
    this.pendingCancelPedidoId = null;
  }

  
}

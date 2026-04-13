import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecetasCrud } from '../../../services/cruds/cocina/recetas-crud';
import { RecetasdetCrud } from '../../../services/cruds/cocina/recetasdet-crud';
import { CatinsumosCrud } from '../../../services/cruds/cocina/catinsumos-crud';
import { EdadesCrud } from '../../../services/cruds/catalogo/edades-crud';
import { HorariosCrud } from '../../../services/cruds/catalogo/horarios-crud';
import { UnidadesCrud } from '../../../services/cruds/catalogo/unidades-crud';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recetas.html',
  styleUrl: './recetas.css'
})
export class Recetas implements OnInit {
  recetaForm: FormGroup;
  detalleForm: FormGroup;

  menuItems = [
    { id: 'list', title: 'Consultar Recetas', active: true },
    { id: 'create', title: 'Crear Receta', active: false },
    { id: 'edit', title: 'Editar Receta', active: false },
    { id: 'delete', title: 'Eliminar Receta', active: false }
  ];

  recetas: any[] = [];
  edades: any[] = [];
  horarios: any[] = [];
  insumos: any[] = [];
  unidades: any[] = [];
  
  selectedRecetaDetails: any[] = [];
  isModalOpen = false;
  isViewModalOpen = false;
  viewRecetaData: any = null;
  viewRecetaDetails: any[] = [];
  loadingDesc = false;
  loadingIns = false;
  selectedRecetaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private recetasCrud: RecetasCrud,
    private recetasDetCrud: RecetasdetCrud,
    private catInsumosCrud: CatinsumosCrud,
    private edadesCrud: EdadesCrud,
    private horariosCrud: HorariosCrud,
    private unidadesCrud: UnidadesCrud,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService
  ) {
    this.recetaForm = this.fb.group({
      nom_receta: ['', Validators.required],
      id_rango_edades: ['', Validators.required],
      id_horarios: ['', Validators.required],
      descrip: [''],
      activo: [true]
    });

    this.detalleForm = this.fb.group({
      id_cat_insumos: ['', Validators.required],
      porcion: ['', [Validators.required, Validators.min(0.01)]]
    });
  }
  // Cargar catálogos y recetas al inicializar el componente
  ngOnInit() {
    this.loadCatalogs();
    this.loadRecetas();
  }
  //Meotodo para cargar catálogos
  loadCatalogs() {
    this.edadesCrud.getEdades().subscribe({
      next: (res: any) => this.edades = res.success ? res.data : [],
      error: (err) => console.error('Error loading edades', err)
    });

    this.horariosCrud.getHorarios().subscribe({
      next: (res: any) => this.horarios = res.success ? res.data : [],
      error: (err) => console.error('Error loading horarios', err)
    });

    this.unidadesCrud.getUnidades().subscribe({
      next: (res: any) => this.unidades = res.success ? res.data : [],
      error: (err) => console.error('Error loading unidades', err)
    });

    this.catInsumosCrud.getCatInsumos().subscribe({
      next: (res: any) => this.insumos = res.success ? res.data : [],
      error: (err) => console.error('Error loading insumos', err)
    });
  }
  //Metodo para cargar recetas
  loadRecetas() {
    this.recetasCrud.getRecetas().subscribe({
      next: (res: any) => {
        if (res.success) this.recetas = res.data;
        else this.errorHandler.handleError(res, 'Error al cargar recetas');
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar recetas')
    });
  }
  //Metodo para activar un item del menu
  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    
    if (selectedItem.id === 'create') {
      this.recetaForm.reset({ activo: true });
      this.selectedRecetaDetails = [];
      this.selectedRecetaId = null;
    } else if (selectedItem.id === 'edit') {
      if (!this.selectedRecetaId) {
        this.recetaForm.reset({ activo: true });
        this.selectedRecetaDetails = [];
      }
    } else if (selectedItem.id === 'delete') {
      this.selectedRecetaId = null;
    }
  }
  //Metodo para abrir modal de agregar ingrediente
  openAddIngredientModal() {
    this.detalleForm.reset();
    this.isModalOpen = true;
  }
  //Metodo para cerrar modal de agregar ingrediente
  closeModal() {
    this.isModalOpen = false;
  }
  //Metodo para abrir modal de ver receta
  openViewModal(receta: any) {
    this.viewRecetaData = receta;
    this.viewRecetaDetails = [];
    this.isViewModalOpen = true;
    this.loadingDesc = true;
    this.loadingIns = true;

    this.recetasCrud.getRecetasDescrip(receta.ID).subscribe({
      next: (res: any) => {
        this.loadingDesc = false;
        if (this.viewRecetaData && this.viewRecetaData.ID === receta.ID) {
          this.viewRecetaData.DESCRIP = res.success && res.data && res.data.length > 0 ? res.data[0].DESCRIP : '';
        }
      },
      error: (err) => {
        this.loadingDesc = false;
        console.error('Error loading description', err);
      }
    });

    this.recetasDetCrud.getRecetasDet(receta.ID).subscribe({
      next: (res: any) => {
        this.loadingIns = false;
        if (this.viewRecetaData && this.viewRecetaData.ID === receta.ID) {
          if (res.success && res.data && res.data.INSUMOS) {
            this.viewRecetaDetails = res.data.INSUMOS.map((d: any) => ({
              ...d,
              NOM_INSUMO: d.NOM_INSUMO || d.INSUMO || this.insumos.find(i => i.ID === d.ID_CAT_INSUMOS)?.NOM_INSUMO,
              NOM_UNIDAD: d.NOM_UNIDAD || d.UNIDAD || this.insumos.find(i => i.ID === d.ID_CAT_INSUMOS)?.UNIDAD
            }));
          } else {
            this.viewRecetaDetails = [];
          }
        }
      },
      error: (err) => {
        this.loadingIns = false;
        console.error('Error loading details', err);
      }
    });
  }
  //Metodo para cerrar modal de ver receta
  closeViewModal() {
    this.isViewModalOpen = false;
    this.viewRecetaData = null;
    this.viewRecetaDetails = [];
    this.loadingDesc = false;
    this.loadingIns = false;
  }
  //Metodo para obtener unidad de un insumo seleccionado
  getSelectedUnidad() {
    const id = Number(this.detalleForm.value.id_cat_insumos);
    const insumo = this.insumos.find(i => i.ID === id);
    return insumo?.UNIDAD;
  }
  //Metodo para agregar ingrediente a receta
  addIngredient() {
    if (this.detalleForm.invalid) return;

    const raw = this.detalleForm.value;
    const insumo = this.insumos.find(i => i.ID === Number(raw.id_cat_insumos));

    const existingIndex = this.selectedRecetaDetails.findIndex(d => d.id_cat_insumos === Number(raw.id_cat_insumos));
    
    if (existingIndex >= 0) {
      this.selectedRecetaDetails[existingIndex].porcion = Number(raw.porcion);
      this.selectedRecetaDetails[existingIndex].NOM_INSUMO = insumo?.NOM_INSUMO;
      this.selectedRecetaDetails[existingIndex].NOM_UNIDAD = insumo?.UNIDAD;
    } else {
      this.selectedRecetaDetails.push({
        id_cat_insumos: Number(raw.id_cat_insumos),
        porcion: Number(raw.porcion),
        NOM_INSUMO: insumo?.NOM_INSUMO,
        NOM_UNIDAD: insumo?.UNIDAD
      });
    }

    this.closeModal();
  }
  //Metodo para remover ingrediente de receta
  removeIngredient(index: number) {
    this.selectedRecetaDetails.splice(index, 1);
  }
  //Metodo para enviar Receta
  onSubmitCreate() {
    if (this.recetaForm.invalid) return;

    const raw = this.recetaForm.value;
    const recetaData = {
      nom_receta: raw.nom_receta,
      id_rango_edades: Number(raw.id_rango_edades),
      id_horarios: Number(raw.id_horarios),
      descrip: raw.descrip || '',
      activo: raw.activo ? 1 : 0
    };

    this.recetasCrud.createReceta(recetaData).subscribe({
      next: (res: any) => {
        if (res.success) {
          const newRecetaId = res.data[0].ID; 
          this.saveDetails(newRecetaId, true);
        } else {
          this.errorHandler.handleError(res, 'Error al crear receta');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear receta')
    });
  }
  //Metodo para recibir datos de receta a actualizar
  setRecetaToUpdate(receta: any) {
    this.selectedRecetaId = receta.ID;

    // Obtener la descripción
    this.recetasCrud.getRecetasDescrip(receta.ID).subscribe({
      next: (res: any) => {
        const description = res.success && res.data && res.data.length > 0 ? res.data[0].DESCRIP : '';
        
        this.recetaForm.patchValue({
          nom_receta: receta.NOM_RECETA,
          id_rango_edades: receta.ID_RANGO_EDADES,
          id_horarios: receta.ID_HORARIOS,
          descrip: description,
          activo: receta.ACTIVO === 1 || receta.ACTIVO === true
        });
      },
      error: (err) => console.error('Error loading description', err)
    });

    // Load details
    this.recetasDetCrud.getRecetasDet(receta.ID).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.INSUMOS) {
          this.selectedRecetaDetails = res.data.INSUMOS.map((d: any) => ({
            id_cat_insumos: d.ID_CAT_INSUMOS,
            porcion: d.PORCION,
            NOM_INSUMO: d.NOM_INSUMO || d.INSUMO || this.insumos.find(i => i.ID === d.ID_CAT_INSUMOS)?.NOM_INSUMO,
            NOM_UNIDAD: d.NOM_UNIDAD || d.UNIDAD || this.insumos.find(i => i.ID === d.ID_CAT_INSUMOS)?.UNIDAD,
            id: d.ID_DET_RECETA
          }));
        } else {
          this.selectedRecetaDetails = [];
        }
      },
      error: (err) => console.error('Error loading details', err)
    });
  }
  //Metodo para actualizar Receta
  onSubmitUpdate() {
    if (this.recetaForm.invalid || !this.selectedRecetaId) return;

    const raw = this.recetaForm.value;
    const recetaData = {
      id: this.selectedRecetaId,
      nom_receta: raw.nom_receta,
      id_rango_edades: Number(raw.id_rango_edades),
      id_horarios: Number(raw.id_horarios),
      descrip: raw.descrip || '',
      activo: raw.activo ? 1 : 0
    };

    this.recetasCrud.updateReceta(recetaData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.saveDetails(this.selectedRecetaId!, false);
        } else {
          this.errorHandler.handleError(res, 'Error al actualizar receta');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar receta')
    });
  }
  //Metodo para guardar detalles de receta
  saveDetails(recetaId: number, isNew: boolean) {
    const finish = () => {
      this.alert.show(isNew ? 'Receta creada exitosamente' : 'Receta actualizada exitosamente', 'success');
      this.recetaForm.reset({ activo: true });
      this.selectedRecetaDetails = [];
      this.selectedRecetaId = null;
      this.loadRecetas();
    };

    const createNewDetails = () => {
        if (this.selectedRecetaDetails.length === 0) {
            finish();
            return;
        }
        
        const detalles = this.selectedRecetaDetails.map(d => ({
            id_cat_insumos: d.id_cat_insumos,
            porcion: d.porcion
        }));

        this.recetasDetCrud.createRecetasDetBatch(recetaId, detalles).subscribe({
            next: (res: any) => finish(),
            error: (err) => {
                this.errorHandler.handleHttpError(err, 'Error al guardar detalles');
                finish();
            }
        });
    };

    if (!isNew) {
        // Eliminar todos los detalles existentes de la receta antes de insertar los nuevos
        this.recetasDetCrud.deleteRecetasDetByRecetaId(recetaId).subscribe({
            next: () => createNewDetails(),
            error: () => createNewDetails() // Si falla (ej. no había detalles), intentamos crear los nuevos de todos modos
        });
    } else {
        createNewDetails();
    }
  }
  //Metodo para recibir datos de receta a eliminar
  setRecetaToDelete(receta: any) {
    this.selectedRecetaId = receta.ID;
  }
  //Metodo para confirmar eliminacion de receta
  confirmDelete() {
    if (!this.selectedRecetaId) return;

    this.recetasCrud.deleteReceta(this.selectedRecetaId).subscribe({
      next: (res: any) => {
        if (res.success) {
            this.alert.show('Receta eliminada exitosamente', 'success');
            this.selectedRecetaId = null;
            this.loadRecetas();
        } else {
            this.errorHandler.handleError(res, 'Error al eliminar receta');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar receta')
    });
  }
}

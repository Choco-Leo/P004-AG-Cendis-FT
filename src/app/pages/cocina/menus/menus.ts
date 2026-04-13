import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert';
import { ErrorHandlerService } from '../../../services/error-handler';

import { MenusCrud } from '../../../services/cruds/cocina/menus-crud';
import { MenusdetCrud } from '../../../services/cruds/cocina/menusdet-crud';
import { RecetasCrud } from '../../../services/cruds/cocina/recetas-crud';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menus.html',
  styleUrl: './menus.css'
})
export class Menus implements OnInit {

  menuForm: FormGroup;
  detalleForm: FormGroup;

  menuItems = [
    { id: 'list', title: 'Consultar Menús', active: true },
    { id: 'create', title: 'Crear Menú', active: false },
    { id: 'edit', title: 'Editar Menú', active: false },
    { id: 'delete', title: 'Eliminar Menú', active: false }
  ];

  menus: any[] = [];
  recetas: any[] = [];
  
  selectedMenuDetails: any[] = [];
  isModalOpen = false;
  isViewModalOpen = false;
  viewMenuData: any = null;
  viewMenuDetails: any[] = [];
  loadingDesc = false; // Kept for consistency, though Menus might not have description
  loadingDet = false;
  selectedMenuId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private menusCrud: MenusCrud,
    private menusDetCrud: MenusdetCrud,
    private recetasCrud: RecetasCrud,
    private alert: AlertService,
    private errorHandler: ErrorHandlerService
  ) {
    this.menuForm = this.fb.group({
      nom_menu: ['', Validators.required],
      activo: [true]
    });
    
    this.detalleForm = this.fb.group({
      id_recetas: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMenus();
    this.loadRecetas();
  }

  loadRecetas() {
    this.recetasCrud.getRecetas().subscribe({
      next: (res: any) => this.recetas = res.success ? res.data : [],
      error: (err) => console.error('Error loading recetas', err)
    });
  }

  loadMenus() {
    this.menusCrud.getMenus().subscribe({
      next: (res: any) => {
        if (res.success) this.menus = res.data;
        else this.errorHandler.handleError(res, 'Error al cargar menus');
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al cargar menus')
    });
  }

  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    
    if (selectedItem.id === 'create') {
      this.menuForm.reset({ activo: true });
      this.selectedMenuDetails = [];
      this.selectedMenuId = null;
    } else if (selectedItem.id === 'edit') {
      if (!this.selectedMenuId) {
        this.menuForm.reset({ activo: true });
        this.selectedMenuDetails = [];
      }
    } else if (selectedItem.id === 'delete') {
      this.selectedMenuId = null;
    }
  }

  openAddRecetaModal() {
    this.detalleForm.reset();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openViewModal(menu: any) {
    this.viewMenuData = menu;
    this.viewMenuDetails = [];
    this.isViewModalOpen = true;
    this.loadingDet = true;
    
    this.menusDetCrud.getMenusDet(menu.ID).subscribe({
      next: (res: any) => {
        this.loadingDet = false;
        if (this.viewMenuData && this.viewMenuData.ID === menu.ID) {
          const details = res.data?.RECETAS || res.data || [];
          this.viewMenuDetails = details.map((d: any) => ({
            ...d,
            NOM_RECETA: d.NOM_RECETA || this.recetas.find(r => r.ID === d.ID_RECETAS)?.NOM_RECETA,
            RANGO_EDAD: d.RANGO_EDAD || this.recetas.find(r => r.ID === d.ID_RECETAS)?.RANGO_EDAD
          }));
        }
      },
      error: (err) => {
        this.loadingDet = false;
        console.error('Error loading details', err);
      }
    });
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.viewMenuData = null;
    this.viewMenuDetails = [];
    this.loadingDet = false;
  }

  addReceta() {
    if (this.detalleForm.invalid) return;

    const raw = this.detalleForm.value;
    const recetaId = Number(raw.id_recetas);
    const receta = this.recetas.find(r => r.ID === recetaId);

    // Check if already added
    const existingIndex = this.selectedMenuDetails.findIndex(d => d.id_recetas === recetaId);
    
    if (existingIndex >= 0) {
      this.alert.show('La receta ya está en el menú', 'warning');
      return;
    } 

    this.selectedMenuDetails.push({
      id_recetas: recetaId,
      NOM_RECETA: receta?.NOM_RECETA,
      RANGO_EDAD: receta?.RANGO_EDAD
    });

    this.closeModal();
  }

  removeReceta(index: number) {
    this.selectedMenuDetails.splice(index, 1);
  }

  onSubmitCreate() {
    if (this.menuForm.invalid) return;

    const raw = this.menuForm.value;
    const menuData = {
      nom_menu: raw.nom_menu,
      activo: raw.activo ? 1 : 0
    };

    this.menusCrud.createMenu(menuData).subscribe({
      next: (res: any) => {
        if (res.success) {
          const newMenuId = res.data.id;
          this.saveDetails(newMenuId, true);
        } else {
          this.errorHandler.handleError(res, 'Error al crear menú');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al crear menú')
    });
  }

  setMenuToUpdate(menu: any) {
    this.selectedMenuId = menu.ID;

    this.menuForm.patchValue({
      nom_menu: menu.NOMBRE,
      activo: menu.ACTIVO === 1 || menu.ACTIVO === true
    });

    // Load details
    this.menusDetCrud.getMenusDet(menu.ID).subscribe({
      next: (res: any) => {
        // Assuming response structure similar to Recetas
        const details = res.data?.RECETAS || res.data || [];
        if (res.success && details) {
          this.selectedMenuDetails = details.map((d: any) => ({
            id_recetas: d.ID_RECETAS,
            NOM_RECETA: d.NOM_RECETA || this.recetas.find(r => r.ID === d.ID_RECETAS)?.NOM_RECETA,
            RANGO_EDAD: d.RANGO_EDAD || this.recetas.find(r => r.ID === d.ID_RECETAS)?.RANGO_EDAD,
            id: d.ID_DET_MENU
          }));
        } else {
          this.selectedMenuDetails = [];
        }
      },
      error: (err) => console.error('Error loading details', err)
    });
  }

  onSubmitUpdate() {
    if (this.menuForm.invalid || !this.selectedMenuId) return;

    const raw = this.menuForm.value;
    const menuData = {
      id: this.selectedMenuId,
      nom_menu: raw.nom_menu,
      activo: raw.activo ? 1 : 0
    };

    this.menusCrud.updateMenu(menuData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.saveDetails(this.selectedMenuId!, false);
        } else {
          this.errorHandler.handleError(res, 'Error al actualizar menú');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al actualizar menú')
    });
  }

  saveDetails(menuId: number, isNew: boolean) {
    const finish = () => {
      this.alert.show(isNew ? 'Menú creado exitosamente' : 'Menú actualizado exitosamente', 'success');
      this.menuForm.reset({ activo: true });
      this.selectedMenuDetails = [];
      this.selectedMenuId = null;
      this.loadMenus();
    };

    const createNewDetails = () => {
        if (this.selectedMenuDetails.length === 0) {
            finish();
            return;
        }
        
        const detalles = this.selectedMenuDetails.map(d => ({
            id_recetas: d.id_recetas
        }));

        this.menusDetCrud.createMenusDetBatch(menuId, detalles).subscribe({
            next: (res: any) => finish(),
            error: (err) => {
                this.errorHandler.handleHttpError(err, 'Error al guardar detalles del menú');
                finish();
            }
        });
    };

    if (!isNew) {
        // Eliminar todos los detalles existentes del menú antes de insertar los nuevos
        this.menusDetCrud.deleteMenusDetByMenuId(menuId).subscribe({
            next: () => createNewDetails(),
            error: () => createNewDetails() // Si falla, intentamos crear los nuevos de todos modos
        });
    } else {
        createNewDetails();
    }
  }

  setMenuToDelete(menu: any) {
    this.selectedMenuId = menu.ID;
  }

  confirmDelete() {
    if (!this.selectedMenuId) return;

    this.menusCrud.deleteMenu(this.selectedMenuId).subscribe({
      next: (res: any) => {
        if (res.success) {
            this.alert.show('Menú eliminado exitosamente', 'success');
            this.selectedMenuId = null;
            this.loadMenus();
        } else {
            this.errorHandler.handleError(res, 'Error al eliminar menú');
        }
      },
      error: (err) => this.errorHandler.handleHttpError(err, 'Error al eliminar menú')
    });
  }
}

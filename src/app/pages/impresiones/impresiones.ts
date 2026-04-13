import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MenusCrud } from '../../services/cruds/cocina/menus-crud';
import { ImpresionesCrud } from '../../services/cruds/impresiones/impresiones-crud';
import { PedidosCrud } from '../../services/cruds/pedidos/pedidos-crud';
import { CendisCrud } from '../../services/cruds/catalogo/cendis-crud';
import { AuthService } from '../../services/auth';
import { UsersCrud } from '../../services/cruds/admin/users-crud';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-impresiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './impresiones.html',
  styleUrl: './impresiones.css'
})
export class Impresiones implements OnInit {
  pdfPreviewUrl: SafeResourceUrl | null = null;
  menus: any[] = [];
  selectedMenuId: number | null = null;
  
  pedidos: any[] = [];
  selectedPedidoId: number | null = null;
  selectedDate: string = this.getLocalISODate();
  selectedCategoria: string = 'Alimentos'; // Categoría por defecto
  emptyMessage: string | null = null;
  
  // Rango de fechas
  selectedStartDate: string = this.getLocalISODate();
  selectedEndDate: string = this.getLocalISODate();
  
  // Admin properties
  isAdmin: boolean = false;
  cendis: any[] = [];
  selectedCendiId: number | null = null;
  selectedCendisIds: number[] = [];

  // Firma Autorizada
  firmaAutorizada: string = '';
  usuarioElabora: string = '';
  
  private currentPdfBlobUrl: string | null = null;

  private getLocalISODate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  menuItems = [
    { id: 'menu', title: 'Imprimir Menú', active: true },
    { id: 'pedido', title: 'Imprimir Pedido', active: false },
    { id: 'pedidofch', title: 'Imprimir Reporte', active: false }
  ];


  constructor(
    private sanitizer: DomSanitizer,
    private menusCrud: MenusCrud,
    private impresionesCrud: ImpresionesCrud,
    private pedidosCrud: PedidosCrud,
    private cendisCrud: CendisCrud,
    private authService: AuthService,
    private usersCrud: UsersCrud,
    private alert: AlertService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadMenus();
    this.loadPedidos();
    this.loadFirma();
  }

  checkUserRole() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.isAdmin = user.id_cargos === 1; // 1 is ADMIN
        if (this.isAdmin) {
          this.loadCendis();
        }
        
        // Construir nombre completo para "Elaboró"
        const nom = user.nombre || '';
        const apP =  user.apellido_p || '';
        const apM = user.apellido_m || '';
        const fullName = `${nom} ${apP} ${apM}`.trim();
        this.usuarioElabora = fullName || user.login_cendi || 'ADMINISTRADOR';
      }
    });
  }

  loadCendis() {
    this.cendisCrud.getCendis().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cendis = response.data;
        }
      },
      error: (error) => console.error('Error al cargar Cendis:', error)
    });
  }

  loadMenus() {
    this.menusCrud.getMenus().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.menus = response.data;
        }
      },
      error: (error) => console.error('Error al cargar menús:', error)
    });
  }

  loadFirma() {
    this.usersCrud.getFirma().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.firmaAutorizada = response.data.NOMBRE;
        }
      },
      error: (error) => console.error('Error al cargar la firma autorizada:', error)
    });
  }

  updateFirma() {
    if (!this.firmaAutorizada || this.firmaAutorizada.trim() === '') {
      this.alert.show('El nombre de la firma no puede estar vacío', 'error');
      return;
    }

    this.usersCrud.updateFirma(this.firmaAutorizada).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert.show('Firma autorizada actualizada correctamente', 'success');
          
          // Recargar previsor basado en la pestaña activa
          const activeItem = this.menuItems.find(item => item.active);
          if (activeItem) {
            if (activeItem.id === 'menu' && this.selectedMenuId) {
              this.generateMenuPdfPreview();
            } else if (activeItem.id === 'pedido' && this.selectedPedidoId) {
              this.generatePedidoPdfPreview();
            } else if (activeItem.id === 'pedidofch' && this.selectedStartDate && this.selectedEndDate) {
              this.generateRangoPedidoPdfPreview();
            }
          }
        } else {
          this.alert.show(response.message || 'Error al actualizar la firma', 'error');
        }
      },
      error: (error) => {
        this.alert.show('Error de conexión al actualizar la firma'+error, 'error');
      }
    });
  }

  loadPedidos() {
    if (this.isAdmin && !this.selectedCendiId) {
      this.pedidos = [];
      return;
    }

    this.pedidosCrud.getPedidos(this.selectedDate, this.selectedCendiId || undefined).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.pedidos = response.data;
        } else {
            this.pedidos = [];
        }
      },
      error: (error) => {
          console.error('Error al cargar pedidos:', error);
          this.pedidos = [];
      }
    });
  }

  onCendiChange() {
      this.selectedPedidoId = null;
      this.pdfPreviewUrl = null;
      this.loadPedidos();
  }

  onDateChange() {
      this.selectedPedidoId = null;
      this.pdfPreviewUrl = null;
      this.loadPedidos();
  }


  setActiveItem(selectedItem: any) {
    this.menuItems.forEach(item => item.active = item === selectedItem);
    this.pdfPreviewUrl = null;
    if (selectedItem.id === 'menu' && this.selectedMenuId) {
      this.generateMenuPdfPreview();
    } else if (selectedItem.id === 'pedido' && this.selectedPedidoId) {
        this.generatePedidoPdfPreview();
    } else if (selectedItem.id === 'pedidofch' && this.selectedStartDate && this.selectedEndDate) {
        this.generateRangoPedidoPdfPreview();
    }
  }


  onMenuSelect() {
    if (this.selectedMenuId) {
      this.generateMenuPdfPreview();
    }
  }

  onPedidoSelect() {
    this.emptyMessage = null;
    if (this.selectedPedidoId) {
      this.generatePedidoPdfPreview();
    }
  }

  onCategoriaChange() {
    this.emptyMessage = null;
    this.pdfPreviewUrl = null;
    if (this.selectedPedidoId) {
      this.generatePedidoPdfPreview();
    }
  }

  onRangoDateChange() {
    this.pdfPreviewUrl = null;
    this.generateRangoPedidoPdfPreview();
  }

  onCendisSelectionChange() {
    this.pdfPreviewUrl = null;
    this.generateRangoPedidoPdfPreview();
  }

  formatNumber(val: any): string {
    const num = Number(val);
    if (isNaN(num)) return val || '0.00';
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  toggleCendiSelection(cendiId: number) {
    const index = this.selectedCendisIds.indexOf(cendiId);
    if (index > -1) {
      this.selectedCendisIds.splice(index, 1);
    } else {
      this.selectedCendisIds.push(cendiId);
    }
    this.onCendisSelectionChange();
  }

  private addSignatures(doc: jsPDF, yPos: number) {
    if (yPos > 220) {
        doc.addPage();
        yPos = 40;
    } else {
        yPos += 20;
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(10);
    doc.setLineWidth(0.5);

    // Left Signature
    const leftSignX = 30;
    const leftSignWidth = 80;
    doc.line(leftSignX, yPos, leftSignX + leftSignWidth, yPos);
    doc.text('Elaboró', leftSignX + (leftSignWidth / 2), yPos + 5, { align: 'center' });
    doc.text(this.usuarioElabora || 'ADMINISTRADOR', leftSignX + (leftSignWidth / 2), yPos + 10, { align: 'center' });

    // Right Signature
    const rightSignX = pageWidth - 30 - 80; 
    const rightSignWidth = 80;
    doc.line(rightSignX, yPos, rightSignX + rightSignWidth, yPos);
    doc.text('Autorizó', rightSignX + (rightSignWidth / 2), yPos + 5, { align: 'center' });
    doc.text(this.firmaAutorizada, rightSignX + (rightSignWidth / 2), yPos + 10, { align: 'center' });
    doc.text('Jefe del Depto. de Administración', rightSignX + (rightSignWidth / 2), yPos + 15, { align: 'center' });
    doc.text('de Centros de Atención Infantil', rightSignX + (rightSignWidth / 2), yPos + 20, { align: 'center' });

    // Bottom Text
    yPos += 30;
    doc.setFontSize(7);
    doc.text('NO SE ACEPTA CON TACHADURAS,', 14, yPos);
    doc.text('RAYADURAS O ENMENDADURAS.', 14, yPos + 4);
    doc.text('c.c.p.-Archivo', 14, yPos + 8);
  }

  private setPdfPreview(doc: jsPDF) {
    // Liberar URL anterior si existe para evitar fugas de memoria
    if (this.currentPdfBlobUrl) {
      URL.revokeObjectURL(this.currentPdfBlobUrl);
    }
    
    const blob = doc.output('blob');
    this.currentPdfBlobUrl = URL.createObjectURL(blob);
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentPdfBlobUrl);
  }


  async generateMenuPdfPreview() {
    if (!this.selectedMenuId) return;
    this.pdfPreviewUrl = null;
    try {
        const doc = await this.createMenuPdfDoc(this.selectedMenuId);
        this.setPdfPreview(doc);
    } catch (error) {
        console.error('Error generating PDF preview', error);
    }
  }

  async downloadMenuPdf() {
    if (!this.selectedMenuId) return;
    try {
        const doc = await this.createMenuPdfDoc(this.selectedMenuId);
        
        const selectedMenu = this.menus.find(m => m.ID == this.selectedMenuId);
        const menuName = selectedMenu ? selectedMenu.NOMBRE.replace(/[^a-zA-Z0-9]/g, '_') : `Menu_${this.selectedMenuId}`;
        
        doc.save(`Insumos_${menuName}.pdf`);
    } catch (error) {
        console.error('Error downloading PDF', error);
    }
  }

  async generatePedidoPdfPreview() {
    if (!this.selectedPedidoId) return;
    this.pdfPreviewUrl = null;
    this.emptyMessage = null;
    try {
        const doc = await this.createPedidoPdfDoc(this.selectedPedidoId);
        if (doc) {
            this.setPdfPreview(doc);
        }
    } catch (error: any) {
        console.error('Error generating PDF preview', error);
    }
  }

  async downloadPedidoPdf() {
    if (!this.selectedPedidoId) return;
    try {
        const doc = await this.createPedidoPdfDoc(this.selectedPedidoId);
        if (doc) {
            doc.save(`Pedido_${this.selectedDate}.pdf`);
        }
    } catch (error) {
        console.error('Error downloading PDF', error);
    }
  }

  async downloadPedidoExcel() {
    if (!this.selectedPedidoId) return;
    
    try {
      const response: any = await new Promise((resolve, reject) => {
        this.impresionesCrud.getDetallesPedidoExcel(this.selectedPedidoId!, this.selectedCendiId || undefined, this.selectedCategoria).subscribe({
          next: resolve,
          error: reject
        });
      });

      if (!response.success) {
        if (response.data && response.data.length === 0) {
            this.emptyMessage = response.message;
            return;
        }
        throw new Error(response.message || 'Error al obtener datos para Excel');
      }

      const data = response.data;
      const excelData: any[] = [];

      // Estructurar datos para Excel
      data.forEach((menuGroup: any) => {
        // Fila de encabezado de Menú
        excelData.push({
          'FOLIO': this.selectedPedidoId,
          'MENÚ': menuGroup.NOM_MENU,
          'INSUMO': '',
          'UNIDAD': '',
          'CANTIDAD_TOTAL': '',
          'CANTIDAD SUGERIDA': '',
          'PRECIO UNITARIO': '',
          'SUBTOTAL': ''
        });

        // Filas de insumos
        menuGroup.INSUMOS.forEach((item: any) => {
          excelData.push({
            'FOLIO': '',
            'MENÚ': '',
            'INSUMO': item.NOM_INSUMO,
            'UNIDAD': item.NOM_UNIDAD,
            'CANTIDAD_TOTAL': this.formatNumber(item.CANTIDAD_TOTAL),
            'CANTIDAD SUGERIDA': this.formatNumber(item.CANTIDAD_SUGERIDA),
            'PRECIO UNITARIO': this.formatNumber(item.PRECIO_UNITARIO),
            'SUBTOTAL': this.formatNumber(item.SUBTOTAL_TOTAL)
          });
        });

        // Fila vacía entre grupos
        excelData.push({});
      });

      // Crear libro y hoja
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Pedido');

      // Descargar archivo
      XLSX.writeFile(workbook, `req${this.selectedPedidoId}.xlsx`);

    } catch (error) {
      console.error('Error al descargar Excel:', error);
    }
  }


  async generateRangoPedidoPdfPreview() {
    if (!this.selectedStartDate || !this.selectedEndDate) return;
    this.pdfPreviewUrl = null;
    try {
        const doc = await this.createRangoPedidoPdfDoc();
        this.setPdfPreview(doc);
    } catch (error) {
        console.error('Error generating PDF preview', error);
    }
  }

  async downloadRangoPedidoPdf() {
    if (!this.selectedStartDate || !this.selectedEndDate) return;
    try {
        const doc = await this.createRangoPedidoPdfDoc();
        doc.save(`Pedido_Rango_${this.selectedStartDate}_${this.selectedEndDate}.pdf`);
    } catch (error) {
        console.error('Error downloading PDF', error);
    }
  }


  private async createPedidoPdfDoc(pedidoId: number): Promise<jsPDF | null> {
    const doc = new jsPDF();
    
    // Fetch data
    const response: any = await new Promise((resolve, reject) => {
        this.impresionesCrud.getDetallesPedido(pedidoId, this.selectedCendiId || undefined, this.selectedCategoria).subscribe({
            next: resolve,
            error: reject
        });
    });

    if (!response.success) {
        if (response.data && response.data.length === 0) {
            this.emptyMessage = response.message;
            return null;
        }
        throw new Error(response.message || 'Error al obtener datos del pedido');
    }

    const data = response.data;

    // Logo
    const img = new Image();
    img.src = 'logoTamaulipas2022.jpg';
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; 
    });
    
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 50;
      const x = (pageWidth - imgWidth) / 2;
      doc.addImage(img, 'JPEG', x, 10, imgWidth, 15);
    } catch (error) {
      console.error('Error al agregar el logo:', error);
    }

    // Title
    doc.setFontSize(12);
    doc.text('INSTITUTO DE PREVISION DE SEGURIDAD SOCIAL DEL ESTADO DE TAMAULIPAS', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REPORTE DE INSUMOS POR PEDIDO', 105, 38, { align: 'center' });
    
    // Cendi Name (Assuming all items belong to the same Cendi, take from first group)
    const cendiName = data.length > 0 ? data[0].NOM_CENDI : '';

    doc.setFontSize(10);
    
    const formattedDate = new Date(this.selectedDate.replace(/-/g, '/')).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`PEDIDO Nº: ${pedidoId}`, 14, 54);
    doc.text(`ÁREA SOLICITANTE: ${cendiName}`, 14, 49);
    doc.text(`Fecha: ${formattedDate}`, 196, 54, { align: 'right' });

    let yPos = 60;

    data.forEach((menuGroup: any) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(10);
        
        doc.text(`SERVICIO SOLICITADO: ${menuGroup.NOM_MENU}`, 14, yPos);
        yPos += 5;

        const columns = ['INSUMO', 'UNIDAD', 'CALCULO', 'CANTIDAD REQUERIDA AL PROVEEDOR'];
        const rows = menuGroup.INSUMOS.map((item: any) => [
            item.NOM_INSUMO, 
            item.NOM_UNIDAD, 
            this.formatNumber(item.CANTIDAD_TOTAL),
            this.formatNumber(item.CANTIDAD_SUGERIDA)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [columns],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], fontSize: 9, halign: 'center' }, // Dark grey #424242
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 'auto' }, // INSUMO
                1: { cellWidth: 30, halign: 'center' }, // UNIDAD
                2: { cellWidth: 30, halign: 'center' }, // CANTIDAD TOTAL
                3: { cellWidth: 30, halign: 'center' }  // CANTIDAD SUGERIDA
            },
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => {
               // Optional: Header on new pages?
            }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    this.addSignatures(doc, yPos);

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    return doc;
  }

  private async createRangoPedidoPdfDoc(): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Fetch data
    const response: any = await new Promise((resolve, reject) => {
        this.impresionesCrud.getRangoFchDetPedidosXCendis(this.selectedStartDate, this.selectedEndDate, this.selectedCendisIds).subscribe({
            next: resolve,
            error: reject
        });
    });

    if (!response.success) {
        throw new Error('Error al obtener datos del reporte');
    }

    const data = response.data;

    // Logo
    const img = new Image();
    img.src = 'logoTamaulipas2022.jpg';
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; 
    });
    
    const addHeader = (doc: jsPDF, pageNum: number) => {
        try {
            const pageWidth = doc.internal.pageSize.getWidth();
            const imgWidth = 50;
            const x = (pageWidth - imgWidth) / 2;
            doc.addImage(img, 'JPEG', x, 10, imgWidth, 15);
        } catch (error) {
            console.error('Error al agregar el logo:', error);
        }

        doc.setFontSize(12);
        doc.text('INSTITUTO DE PREVISION DE SEGURIDAD SOCIAL DEL ESTADO DE TAMAULIPAS', 105, 30, { align: 'center' });
        doc.text('REPORTE ACUMULADO DE INSUMOS POR RANGO DE FECHAS', 105, 38, { align: 'center' });
        
        doc.setFontSize(10);
        const startFormatted = new Date(this.selectedStartDate.replace(/-/g, '/')).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        const endFormatted = new Date(this.selectedEndDate.replace(/-/g, '/')).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`DEL: ${startFormatted}  AL: ${endFormatted}`, 105, 46, { align: 'center' });
    };

    let isFirstPage = true;

    data.forEach((cendiGroup: any) => {
        if (!isFirstPage) {
            doc.addPage();
        }
        addHeader(doc, doc.getNumberOfPages());
        isFirstPage = false;

        let yPos = 55;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`CENDI: ${cendiGroup.NOM_CENDI}`, 14, yPos);
        yPos += 7;

        const columns = ['INSUMO', 'UNIDAD', 'CANTIDAD REQUERIDA AL PROVEEDOR'];
        const rows = cendiGroup.INSUMOS.map((item: any) => [
            item.NOM_INSUMO, 
            item.NOM_UNIDAD, 
            this.formatNumber(item.CANTIDAD_TOTAL)
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [columns],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], fontSize: 9, halign: 'center' },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 'auto' }, 
                1: { cellWidth: 40, halign: 'center' },
                2: { cellWidth: 50, halign: 'center' }
            },
            margin: { left: 14, right: 14 }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    return doc;
  }

  private async createMenuPdfDoc(menuId: number): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Fetch data
    const response: any = await new Promise((resolve, reject) => {
        this.impresionesCrud.getInsumosMenuByRangoEdad(menuId).subscribe({
            next: resolve,
            error: reject
        });
    });

    if (!response.success) {
        throw new Error('Error al obtener datos del menú');
    }

    const data = response.data;
    const selectedMenu = this.menus.find(m => m.ID == menuId); // Use loose equality just in case string/number mismatch
    const menuTitle = selectedMenu ? selectedMenu.NOMBRE : 'Menú';

    // Logo
    const img = new Image();
    img.src = 'logoTamaulipas2022.jpg';
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; 
    });
    
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 50;
      const x = (pageWidth - imgWidth) / 2;
      doc.addImage(img, 'JPEG', x, 10, imgWidth, 15);
    } catch (error) {
      console.error('Error al agregar el logo:', error);
    }

    // Title
    doc.setFontSize(12);
    doc.text('INSTITUTO DE PREVISION DE SEGURIDAD SOCIAL DEL ESTADO DE TAMAULIPAS', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REPORTE DE INSUMOS POR MENÚ', 105, 38, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Menú: ${menuTitle}`, 105, 46, { align: 'center' });

    let yPos = 55;

    data.forEach((rango: any) => {
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rango de Edad: ${rango.NOM_RANGO_EDAD}`, 14, yPos);
        yPos += 8;

        rango.HORARIOS.forEach((horario: any) => {
             if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold'); // Keep bold for subheader
            doc.text(`Horario: ${horario.NOM_HORARIO}`, 14, yPos);
            yPos += 5;

            const columns = ['INSUMO', 'UNIDAD', 'PROPORCION POR NIÑO'];
            const rows = horario.INSUMOS.map((item: any) => [
                item.NOM_INSUMO, 
                item.NOM_UNIDAD, 
                this.formatNumber(item.CANTIDAD)
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [columns],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66], fontSize: 9, halign: 'center' }, // Dark grey #424242
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 'auto' }, // INSUMO
                    1: { cellWidth: 30, halign: 'center' }, // UNIDAD
                    2: { cellWidth: 40, halign: 'center' }  // PROPORCION POR NIÑO
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                   // Optional: Header on new pages?
                }
            });

            yPos = (doc as any).lastAutoTable.finalY + 8;
        });
        
        yPos += 5;
    });

    this.addSignatures(doc, (doc as any).lastAutoTable.finalY || 60);

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    return doc;
  }


}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorImportadorasComponent } from '../../../buscadores/buscador-importador/buscador-importador.component';
import { Importador } from '../../../gestion-importadores/importadores';
import { GestionReporteImportadorService } from '../../gestion-reportes-importador.service';
import Swal from 'sweetalert2';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { Paginator } from '../../../paginator';
import { BuscadorMarcasImportadorComponent } from 'app/modules/admin/buscadores/buscador-marcas-importador/buscador-marcas-importador.component';
import { Marca } from 'app/modules/admin/gestion-marcas/marcas';
import { BuscadorCategoriasComponent } from 'app/modules/admin/buscadores/buscador-categorias/buscador-categorias.component';
import { TipoProducto } from 'app/modules/admin/gestion-tipoProductos/tipoProductos';
import { BuscadorReferenciasComponent } from 'app/modules/admin/buscadores/buscador-referencias/buscador-referencias.component';
import { Referencia } from 'app/modules/admin/gestion-referencias/referencias';

@Component({
    selector: 'reporte-repuestos-activos',
    templateUrl: './reporte-repuestos-activos.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteRepuestosActivosComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Paginator
    dataPaginator$: Observable<any>;
    dataCount: number = 0;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    data: any;
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumns: string[] = ['material', 'pieza_fabricante', 'nombre', 'descripcion', 'marca', 'referencia','categoria'];
    orderBy: string = "1";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    cantidad: number;

    valorTotalRepuestos: number = 0;
    valorTotalManoObra: number = 0;
    valorTotal: number = 0;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;
    puedeSeleccionarImportador: boolean = false;
    puedeSeleccionarCategoria: boolean = false;
    puedeSeleccionarReferencia: boolean = false;

    form = this._formBuilder.group({
        fecha_inicial: null,
        fecha_final: null,
        id_importador: null,
        nombre_importador: null,
        id_marca: null,
        nombre_marca: null,
        id_tipo_producto: null,
        nombre_tipo_producto: null,
        id_referencia: null,
        nombre_referencia: null,
        proceso: 'all',
    });

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _gestionReporteService: GestionReporteImportadorService,
        private _gestionReportesService: GestionReportesService,
        private _aut: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {
        // Make the data source sortable
        this.dataSource.sort = this.sort;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the contactenoss
        if (this._aut.accessAdmin == 'administrador') {
            this.puedeSeleccionarImportador = true;
        } else if (this._aut.accessAdmin == 'importador') {
            this.puedeSeleccionarImportador = false;
            this.form.get('id_importador').setValue(this._aut.accessImportador);
            this.form.get('nombre_importador').setValue(this._aut.accessCompany);
        } else if (this._aut.accessAdmin == 'distribuidor') {
            this.puedeSeleccionarImportador = true;
        }

        this.dataPaginator$ = this._gestionReporteService.dataPaginator$;
        this.dataSource.sort = this.sort;

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * Open categorias dialog
    */
    openBuscadorImportador(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorImportadorasComponent, {
            data: {
                idTaller: localStorage.getItem('accessTaller')
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Importador = result[1];
                this.form.get('id_importador').setValue(selected.id);
                this.form.get('nombre_importador').setValue(selected.nombre);
                this.form.get('id_marca').setValue('');
                this.form.get('nombre_marca').setValue('');
            });
    }

    consultarData() {
        const busqueda = this.form.getRawValue();
        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        paginator.id_importador = busqueda.id_importador;
        paginator.id_marca = busqueda.id_marca;
        paginator.id_categoria = busqueda.id_tipo_producto;
        paginator.id_referencia = busqueda.id_referencia;

        // Search
        this._gestionReporteService.getRepuestosActivosImportadorPaginator(paginator).subscribe(data => {

            // Update the counts
            this.dataCount = data.cantidad[0]['total'];

            // Store the table data
            this.dataSource.data = data.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this.dataSource.sort = this.sort;

    }

    sortData(sort: Sort) {
        this.order = sort.direction;
        this.orderBy = sort.active;
        this.consultarData();
    }

    mostrarMas(e: any) {
        this.pageIndex = e.pageIndex * 10;
        this.pageSize = e.pageSize;
        this.consultarData();
    }

    applyFilter(filterValue: string): void {
        this.filter = (filterValue || 'all').trim().toLowerCase();
        //this.paginator.firstPage();
        this.consultarData();
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
    * Open marcas dialog
    */
     openBuscadorMarcas(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasImportadorComponent, {
            data: {
                idImportador: this.form.get('id_importador').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.form.get('id_marca').setValue(selected.id);
                this.form.get('nombre_marca').setValue(selected.nombre);
                this.form.get('id_referencia').setValue("");
                this.form.get('nombre_referencia').setValue("");
                this.puedeSeleccionarCategoria = true;
            });
    }

    /**
    * Open categorias dialog
    */
    openBuscadorCategoria(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorCategoriasComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: TipoProducto = result[1];
                this.form.get('id_tipo_producto').setValue(selected.id);
                this.form.get('nombre_tipo_producto').setValue(selected.nombre);
                this.form.get('id_referencia').setValue("");
                this.form.get('nombre_referencia').setValue("");
                this.puedeSeleccionarReferencia = true;
            });
    }

    /**
    * Open subcategorias dialog
    */
    openBuscadorReferencias(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorReferenciasComponent, {
            data: {
                idTipoProducto: this.form.get('id_tipo_producto').value,
                idImportador: this.form.get('id_importador').value,
                idMarca: this.form.get('id_marca').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Referencia = result[1];
                this.form.get('id_referencia').setValue(selected.id);
                this.form.get('nombre_referencia').setValue(selected.nombre);
            });
    }


    /**
     * Create contactenos
     */
    exportar(): void {
        const busqueda = this.form.getRawValue();
        if (this._aut.accessAdmin == 'distribuidor') {
            busqueda.id_importador = this._aut.accessImportador;
        }
        this._gestionReporteService.getExportRepuestosActivosImportadorPaginator(busqueda).subscribe(data => {
            if (data.registros.length > 0) {
                var head = ['material', 'pieza_fabricante', 'nombre', 'descripcion', 'marca', 'referencia','categoria'];
                this._gestionReportesService.exportReportAsExcelFile(data.registros, 'reporte_repuestos_activos_por_importador', head, []);
            } else {
                Swal.fire({
                    title: 'No existe información para exportar reporte con los parámetros de búsqueda ingresados',
                    icon: 'error',
                    timer: 2500
                })
            }
        })
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    abrirDetalleFactura() {

    }

}

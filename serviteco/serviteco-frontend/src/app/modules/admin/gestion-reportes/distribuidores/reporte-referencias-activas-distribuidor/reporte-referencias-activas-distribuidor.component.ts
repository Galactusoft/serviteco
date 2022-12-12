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
import { GestionReporteDistribuidorService } from '../../gestion-reportes-distribuidor.service';
import Swal from 'sweetalert2';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { Paginator } from '../../../paginator';
import { BuscadorDistribuidoresImportadorComponent } from 'app/modules/admin/buscadores/buscador-distribuidores-importador/buscador-distribuidores-importador.component';

@Component({
    selector: 'reporte-referencias-activas-distribuidor',
    templateUrl: './reporte-referencias-activas-distribuidor.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteReferenciasActivasDistribuidorComponent implements OnInit, OnDestroy {
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
    tableColumns: string[] = ['id', 'nombre', 'categoria', 'importador', 'marca', 'estado'];
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
    puedeSeleccionarDistribuidor: boolean = false;

    form = this._formBuilder.group({
        fecha_inicial: null,
        fecha_final: null,
        id_importador: null,
        nombre_importador: null,
        id_marca: null,
        nombre_marca: null,
        id_distribuidor: null,
        nombre_distribuidor: null,
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
        private _gestionReporteService: GestionReporteDistribuidorService,
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
            this.puedeSeleccionarDistribuidor = true;
        } else if (this._aut.accessAdmin == 'importador') {
            this.puedeSeleccionarImportador = false;
            this.form.get('id_importador').setValue(this._aut.accessImportador);
            this.form.get('nombre_importador').setValue(this._aut.accessCompany);
        } else if (this._aut.accessAdmin == 'distribuidor') {
            this.puedeSeleccionarDistribuidor = false;
            this.puedeSeleccionarImportador = true;
            this.form.get('id_distribuidor').setValue(this._aut.accessDistribuidor);
            this.form.get('nombre_distribuidor').setValue(this._aut.accessCompany);
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
                idDistribuidor: localStorage.getItem('accessDistribuidor')
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


    /**
    * Open categorias dialog
    */
     openBuscadorDistribuidor(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorDistribuidoresImportadorComponent, {
            data: {
                idImportador: this.form.get('id_importador').value,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Importador = result[1];
                this.form.get('id_distribuidor').setValue(selected.id);
                this.form.get('nombre_distribuidor').setValue(selected.nombre);
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
        paginator.id_distribuidor = this._aut.accessDistribuidor;
        paginator.id_importador = busqueda.id_importador;
        paginator.fecha_inicial = busqueda.fecha_inicial;
        paginator.fecha_final = busqueda.fecha_final;
        // Search
        this._gestionReporteService.getReferenciasActivasDistribuidorPaginator(paginator).subscribe(data => {

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
     * Create contactenos
     */
    exportar(): void {
        const busqueda = this.form.getRawValue();
        if (this._aut.accessAdmin == 'distribuidor') {
            busqueda.id_importador = this._aut.accessImportador;
        }
        this._gestionReporteService.getExportReferenciasActivasDistribuidorPaginator(busqueda).subscribe(data => {
            if (data.registros.length > 0) {
                var head = ['Código', 'Nombre', 'Descripción', 'Categoría', 'Importador', 'Marca', 'Estado', 'Fecha Sistema'];
                this._gestionReportesService.exportReportAsExcelFile(data.registros, 'reporte_referencias_activas_distribuidor', head, []);
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

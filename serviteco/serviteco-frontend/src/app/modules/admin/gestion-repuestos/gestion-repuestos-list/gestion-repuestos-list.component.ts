import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Repuesto, RepuestoMarca, RepuestoPaginator } from '../repuestos';
import { GestionRepuestosService } from '../gestion-repuestos.service';
import { MatPaginator } from '@angular/material/paginator';
import { Paginator } from '../../paginator';
import { Marca } from '../../gestion-marcas/marcas';
import { Referencia } from '../../gestion-referencias/referencias';
import { GestionReferenciasService } from '../../gestion-referencias/gestion-referencias.service';
import Swal from 'sweetalert2';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';

@Component({
    selector: 'gestion-repuestos-list',
    templateUrl: './gestion-repuestos-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionrepuestosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    repuestoPaginator$: Observable<RepuestoPaginator>;

    repuestosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedrepuestos: Repuesto;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'nombre', 'descripcion', 'nombre_categoria', 'nombre_referencia', 'nombre_marca', 'estado'];

    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    cantidad: number;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;

    listadoMarcas: Marca[];
    listadoReferencias: Referencia[];

    verLogoMarcas: boolean = true;
    verLogoReferencias: boolean = false;

    idMarcaBusqueda: string = "";
    idReferenciaBusqueda: string = "";

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionRepuestosService: GestionRepuestosService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _gestionReferenciasService: GestionReferenciasService,
        private _gestionReportesService: GestionReportesService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {
        // Make the data source sortable
        this.recentTransactionsDataSource.sort = this.sort;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.listadoMarcas = [];
        this.listadoReferencias = [];
        // Get the repuestos
        this.repuestoPaginator$ = this._gestionRepuestosService.repuestoPaginator$;

        this.recentTransactionsDataSource.sort = this.sort;

        this._gestionRepuestosService.marcas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((marcas: RepuestoMarca) => {

                // Update the counts
                this.listadoMarcas = marcas.registros;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the repuesto
        this._gestionRepuestosService.repuesto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repuesto: Repuesto) => {

                // Update the selected repuestos
                this.selectedrepuestos = repuesto;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected repuestos  when drawer closed
                this.selectedrepuestos = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

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

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.createRepuesto();
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

    consultarData() {

        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        paginator.id_marca = this.idMarcaBusqueda;
        paginator.id_referencia = this.idReferenciaBusqueda;
        // Search
        this._gestionRepuestosService.getRepuestoPaginator(paginator).subscribe(data => {

            // Update the counts
            this.repuestosCount = data.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = data.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this.recentTransactionsDataSource.sort = this.sort;
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
        this.paginator.firstPage();
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
     * Create usuario
     */
    createRepuesto(): void {
        // Go to the new Repuesto
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create Repuesto
     */
    editRepuesto(repuesto: Repuesto): void {

        this.selectedrepuestos = repuesto;

        // Go to the new repuesto
        this._router.navigate(['./', repuesto.id], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
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

    showReferencias(marca: Marca) {
        this.idMarcaBusqueda = marca.id;

        this._gestionRepuestosService.getRepuestosReferencias(marca.id).subscribe(referencias => {
            this.listadoReferencias = referencias.registros;

            this.verLogoMarcas = false;
            this.verLogoReferencias = true;


            const paginator = new Paginator();
            paginator.pageIndex = this.pageIndex;
            paginator.pageSize = this.pageSize;
            paginator.filter = this.filter || 'all';
            paginator.order = this.order;
            paginator.orderBy = this.orderBy;
            paginator.id_marca = this.idMarcaBusqueda;
            // Search
            this._gestionRepuestosService.getRepuestoPaginator(paginator).subscribe(data => {

                // Update the counts
                this.repuestosCount = data.cantidad;

                // Store the table data
                this.recentTransactionsDataSource.data = data.registros;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

    }

    volverMarcas() {
        this.idMarcaBusqueda = "";
        this.verLogoMarcas = true;
        this.verLogoReferencias = false;

        //this.productosCount = null;

        // Store the table data
        this.recentTransactionsDataSource.data = null;

        this.loadData = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showRepuestosFilter(referencia: Referencia) {
        this.idReferenciaBusqueda = referencia.id;

        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        paginator.id_marca = this.idMarcaBusqueda;
        paginator.id_referencia = this.idReferenciaBusqueda;
        // Search
        this._gestionRepuestosService.getRepuestoPaginator(paginator).subscribe(data => {

            // Update the counts
            this.repuestosCount = data.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = data.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    exportar() {
        var head = ['Código', 'Referencia interna', 'N° pieza fabricante', 'Nombre', 'Descripción', 'Marca', 'Referencia', 'Categoría',  'Estado'];
        this._gestionRepuestosService.getRepuestosExport().subscribe(listado => {
            if (listado.length > 0) {
                this._gestionReportesService.exportAsExcelFile(listado, 'repuestos_', head, 0);
            } else {
                Swal.fire({
                    title: 'No hay datos para exportar',
                    icon: 'error',
                    timer: 1000
                })

            }
        });
    }

}

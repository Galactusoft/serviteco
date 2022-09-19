import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Referencia, ReferenciasImportador, ReferenciasPaginator } from '../referencias';
import { GestionReferenciasService } from '../gestion-referencias.service';
import { Importador } from '../../gestion-importadores/importadores';
import { Marca } from '../../gestion-marcas/marcas';
import { GestionMarcasService } from '../../gestion-marcas/gestion-marcas.service';
import { GestionImportadoresService } from '../../gestion-importadores/gestion-importadores.service';
import { Paginator } from '../../paginator';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-referencias-list',
    templateUrl: './gestion-referencias-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionReferenciasListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    referenciasPaginator$: Observable<ReferenciasPaginator>;

    referenciasCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedReferencia: Referencia;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'nombre', 'nombre_tipo_producto', 'nombre_importador', 'nombre_marca', 'estado'];

    orderBy: string = "id";
    order: string = "desc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;

    listadoImportadores: Importador[];
    listadoMarcas: Marca[];

    verLogoImportadores: boolean = true;
    verLogoMarcas: boolean = false;

    idImportadorBusqueda: string = "";
    idMarcaBusqueda: string = "";

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionReferenciasService: GestionReferenciasService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _gestionMarcasService: GestionMarcasService,
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
        this.listadoImportadores = [];
        this.listadoMarcas = [];
        // Get the referencias
        this.referenciasPaginator$ = this._gestionReferenciasService.referenciasPaginator$;

        this.recentTransactionsDataSource.sort = this.sort;

        this._gestionReferenciasService.importadores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((importadores: ReferenciasImportador) => {

                // Update the counts
                this.listadoImportadores = importadores.registros;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the referencia
        this._gestionReferenciasService.referencia$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((referencia: Referencia) => {

                // Update the selected referencia
                this.selectedReferencia = referencia;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected referencia  when drawer closed
                this.selectedReferencia = null;

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
                this.createReferencia();
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
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        // Search
        this._gestionReferenciasService.getReferenciasPaginator(paginator).subscribe(data => {

            // Update the counts
            this.referenciasCount = data.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = data.registros;

            this.loadData = true;

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
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
        this.consultarData();
    }

    applyFilter(filterValue: string): void {
        this.filter = (filterValue || 'all').trim().toLowerCase();
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
     * Create referencia
     */
    createReferencia(): void {
        // Go to the new referencia
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create referencia
     */
    editReferencia(referencia: Referencia): void {

        this.selectedReferencia = referencia;

        // Go to the new referencia
        this._router.navigate(['./', referencia.id], { relativeTo: this._activatedRoute });

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

    showMarcas(importador: Importador) {
        this.idImportadorBusqueda = importador.id;

        this._gestionMarcasService.getLogoMarcasPorImportador(importador.id).subscribe(marcas => {
            this.listadoMarcas = marcas.registros;

            this.verLogoImportadores = false;
            this.verLogoMarcas = true;

            const paginator = new Paginator();
            paginator.pageIndex = this.pageIndex;
            paginator.pageSize = this.pageSize;
            paginator.filter = this.filter || 'all';
            paginator.order = this.order;
            paginator.orderBy = this.orderBy;
            paginator.id_importador = this.idImportadorBusqueda;
            // Search
            this._gestionReferenciasService.getReferenciasPaginator(paginator).subscribe(data => {

                // Update the counts
                this.referenciasCount = data.cantidad;

                // Store the table data
                this.recentTransactionsDataSource.data = data.registros;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        })
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    volverImportadores() {
        this.idMarcaBusqueda = "";
        this.verLogoImportadores = true;
        this.verLogoMarcas = false;

        //this.productosCount = null;

        // Store the table data
        this.recentTransactionsDataSource.data = null;

        this.loadData = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showReferenciasFilter(marca: Marca) {
        this.idMarcaBusqueda = marca.id;

        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        // Search
        this._gestionReferenciasService.getReferenciasPaginator(paginator).subscribe(data => {

            // Update the counts
            this.referenciasCount = data.cantidad;

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
        var head = ['Código', 'Nombre', 'Descripción', 'Nombre categoría', 'Importador', 'Marca', 'Estado'];
        this._gestionReferenciasService.getReferenciasExport().subscribe(listado => {
            if (listado.length > 0) {
                this._gestionReportesService.exportAsExcelFile(listado, 'referencias_', head, 0);
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

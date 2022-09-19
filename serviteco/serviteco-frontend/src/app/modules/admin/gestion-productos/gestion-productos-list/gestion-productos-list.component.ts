import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Producto, ProductoImportador, ProductoPaginator } from '../productos';
import { GestionProductosService } from '../gestion-productos.service';
import { MatPaginator } from '@angular/material/paginator';
import { Paginator } from '../../paginator';
import { AuthService } from 'app/core/auth/auth.service';
import { Importador } from '../../gestion-importadores/importadores';
import { Marca } from '../../gestion-marcas/marcas';
import { GestionMarcasService } from '../../gestion-marcas/gestion-marcas.service';
import { GestionReferenciasService } from '../../gestion-referencias/gestion-referencias.service';
import { Referencia } from '../../gestion-referencias/referencias';
import { GestionTipoProductosService } from '../../gestion-tipoProductos/gestion-tipoProductos.service';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';

@Component({
    selector: 'gestion-productos-list',
    templateUrl: './gestion-productos-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionProductosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    productoPaginator$: Observable<ProductoPaginator>;
    importadoras$: Observable<Importador>;

    productosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedProducto: Producto;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'serial', 'nombre_tipo_producto', 'nombre', 'nombre_marca', 'nombre_importador', 'nombre_distribuidor', 'estado'];

    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    cantidad: number;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;
    usuarioTallerAutorizado: boolean = false;
    listadoImportadores: Importador[];
    listadoMarcas: Marca[];
    listadoReferencias: Referencia[];
    listadoCategorias: TipoProducto[];

    verLogoImportadores: boolean = true;
    verLogoMarcas: boolean = false;
    verLogoCategorias: boolean = false;
    verLogoReferencias: boolean = false;

    idImportadorBusqueda: string = "";
    idMarcaBusqueda: string = "";
    idCategoriaBusqueda: string = "";
    idReferenciaBusqueda: string = "";

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionProductosService: GestionProductosService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _aut: AuthService,
        private _gestionMarcasService: GestionMarcasService,
        private _gestionReferenciasService: GestionReferenciasService,
        private _gestionTipoProductosService: GestionTipoProductosService
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
        if (this._aut.accessAdmin == 'taller autorizado') {
            this.usuarioTallerAutorizado = true;
            this.recentTransactionsTableColumns = ['id', 'serial', 'nombre_tipo_producto', 'nombre', 'nombre_marca', 'nombre_importador'];
        } else {
            this.usuarioTallerAutorizado = false;
            this.recentTransactionsTableColumns = ['id', 'serial', 'nombre_tipo_producto', 'nombre', 'nombre_marca', 'nombre_importador', 'nombre_distribuidor', 'estado'];
        }
        // Get the productos
        this.productoPaginator$ = this._gestionProductosService.productoPaginator$;

        this.recentTransactionsDataSource.sort = this.sort;
        this._gestionProductosService.importadores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((importadores: ProductoImportador) => {

                // Update the counts
                this.listadoImportadores = importadores.registros;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the producto
        this._gestionProductosService.producto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((producto: Producto) => {

                // Update the selected producto
                this.selectedProducto = producto;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected producto  when drawer closed
                this.selectedProducto = null;

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
                this.createProducto();
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
        paginator.id_referencia = this.idReferenciaBusqueda;
        // Search
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(data => {

            // Update the counts
            this.productosCount = data.cantidad;

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
     * Create producto
     */
    createProducto(): void {
        // Go to the new producto
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create producto
     */
    editProducto(producto: Producto): void {

        this.selectedProducto = producto;

        // Go to the new producto
        this._router.navigate(['./', producto.id], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    volverImportadores() {
        this.idMarcaBusqueda = "";
        this.verLogoImportadores = true;
        this.verLogoCategorias = false;
        this.verLogoMarcas = false;

        this.productosCount = null;

        // Store the table data
        this.recentTransactionsDataSource.data = null;

        this.loadData = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showMarcas(importador: Importador) {
        this.idImportadorBusqueda = importador.id;

        this._gestionMarcasService.getLogoMarcasPorImportador(importador.id).subscribe(marcas => {
            this.listadoMarcas = marcas.registros;

            this.verLogoImportadores = false;
            this.verLogoCategorias = false;
            this.verLogoMarcas = true;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    volverMarcas() {
        this.idReferenciaBusqueda = "";
        this.idMarcaBusqueda = "";
        this._gestionMarcasService.getLogoMarcasPorImportador(this.idImportadorBusqueda).subscribe(marcas => {
            this.listadoMarcas = marcas.registros;

            this.verLogoImportadores = false;
            this.verLogoCategorias = false;
            this.verLogoMarcas = true;
            this.verLogoReferencias = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    volverCategorias() {
        this.idReferenciaBusqueda = "";
        this._gestionTipoProductosService.getTipoProductos().subscribe(referencias => {
            this.listadoCategorias = referencias;

            this.verLogoImportadores = false;
            this.verLogoMarcas = false;
            this.verLogoReferencias = false;
            this.verLogoCategorias = true;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showReferencias(categoria: TipoProducto) {
        this.idCategoriaBusqueda = categoria.id;

        this._gestionReferenciasService.getLogoReferenciasPorMarcaCategoria(this.idMarcaBusqueda, this.idCategoriaBusqueda).subscribe(referencias => {
            this.listadoReferencias = referencias.registros;

            this.verLogoImportadores = false;
            this.verLogoCategorias = false;
            this.verLogoMarcas = false;
            this.verLogoReferencias = true;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        paginator.id_categoria = this.idCategoriaBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showCategorias(marca: Marca) {
        this.idMarcaBusqueda = marca.id;

        this._gestionTipoProductosService.getTipoProductos().subscribe(referencias => {
            this.listadoCategorias = referencias;

            this.verLogoImportadores = false;
            this.verLogoMarcas = false;
            this.verLogoReferencias = false;
            this.verLogoCategorias = true;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showProductosFilter(referencia: Referencia) {
        this.idReferenciaBusqueda = referencia.id;

        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_importador = this.idImportadorBusqueda;
        paginator.id_marca = this.idMarcaBusqueda;
        paginator.id_referencia = this.idReferenciaBusqueda;
        this._gestionProductosService.getProductoPaginator(paginator).subscribe(productoPaginator => {
            // Update the counts
            this.productosCount = productoPaginator.cantidad;

            // Store the table data
            this.recentTransactionsDataSource.data = productoPaginator.registros;

            this.loadData = true;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

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

}

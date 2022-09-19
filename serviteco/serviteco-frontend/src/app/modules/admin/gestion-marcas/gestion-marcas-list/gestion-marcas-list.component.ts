import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from 'app/shared/generic-data-table/table-column.interface';
import { Marca } from '../marcas';
import { GestionMarcasService } from '../gestion-marcas.service';

@Component({
    selector: 'gestion-marcas-list',
    templateUrl: './gestion-marcas-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionMarcasListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    marcas$: Observable<Marca[]>;

    marcasCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedMarca: Marca;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'nombre', 'descripcion', 'estado'];

    orderBy: string = "id";
    order: string = "desc";
    filter: string = "all";
    pageIndex: string = "0";
    pageSize: string = "10";
    pageSizeInit = 10;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;
    tableColumns: TableColumn<any>[] = [
        {
            label: 'Nombre ',
            property: 'nombre',
            type: 'text',
            cssClasses: ['font-medium', 'w-100', 'min-w-100'],
        },
        {
            label: 'descripcion',
            property: 'descripcion',
            type: 'text',
            cssClasses: ['font-medium', 'text-center', 'w-40', 'min-w-40'],
        },
        {
            label: 'Estado',
            property: 'estado',
            type: 'text',
            cssClasses: ['font-medium', 'text-center', 'w-40', 'min-w-40'],
        },
    
    ];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionMarcasService: GestionMarcasService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
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
        // Get the marcas
        this.marcas$ = this._gestionMarcasService.marcas$;
        this._gestionMarcasService.marcas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((marcas: Marca[]) => {

                // Update the counts
                this.marcasCount = marcas.length;

                // Store the table data
                this.recentTransactionsDataSource.data = marcas;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the marca
        this._gestionMarcasService.marca$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((marca: Marca) => {

                // Update the selected marca
                this.selectedMarca = marca;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected marca when drawer closed
                this.selectedMarca = null;

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
                this.createMarca();
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
        // Search
        this._gestionMarcasService.searchMarca(this.filter || 'all', this.pageIndex, this.pageSize, this.orderBy, this.order).subscribe(data => {

            // Update the counts
            this.marcasCount = JSON.parse(JSON.stringify(data)).totalElements;

            // Store the table data
            this.recentTransactionsDataSource.data = JSON.parse(JSON.stringify(data)).content;

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
        this.filter = filterValue;
        this.recentTransactionsDataSource.filter = filterValue.trim().toLowerCase();
        this.marcasCount = this.recentTransactionsDataSource.filteredData.length;
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
     * Create marca
     */
    createMarca(): void {
        // Go to the new marca
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create marca
     */
    editMarca(marca: Marca): void {

        this.selectedMarca = marca;

        // Go to the new marca
        this._router.navigate(['./', marca.id], { relativeTo: this._activatedRoute });

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

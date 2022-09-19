import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Distribuidor } from '../distribuidores';
import { GestionDistribuidoresService } from '../gestion-distribuidores.service';

@Component({
    selector: 'gestion-distribuidores-list',
    templateUrl: './gestion-distribuidores-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionDistribuidoresListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    distribuidores$: Observable<Distribuidor[]>;

    distribuidoresCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedDistribuidor: Distribuidor;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'nit', 'nombre', 'direccion', 'telefono','correo','correo_contabilidad','estado',];

    orderBy: string = "id";
    order: string = "desc";
    filter: string = "all";
    pageIndex: string = "0";
    pageSize: string = "10";
    pageSizeInit = 10;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;
   

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
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
        // Get the distribuidores
        this.distribuidores$ = this._gestionDistribuidoresService.distribuidores$;
        this._gestionDistribuidoresService.distribuidores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((distribuidores: Distribuidor[]) => {

                // Update the counts
                this.distribuidoresCount = distribuidores.length;

                // Store the table data
                this.recentTransactionsDataSource.data = distribuidores;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the distribuidor
        this._gestionDistribuidoresService.distribuidor$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((distribuidor: Distribuidor) => {

                // Update the selected distribuidor
                this.selectedDistribuidor = distribuidor;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected distribuidor when drawer closed
                this.selectedDistribuidor = null;

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
                this.createDistribuidor();
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
        this._gestionDistribuidoresService.searchDistribuidor(this.filter || 'all', this.pageIndex, this.pageSize, this.orderBy, this.order).subscribe(data => {

            // Update the counts
            this.distribuidoresCount = JSON.parse(JSON.stringify(data)).totalElements;

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
        this.distribuidoresCount = this.recentTransactionsDataSource.filteredData.length;
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
     * Create distribuidor
     */
    createDistribuidor(): void {
        // Go to the new distribuidor
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create distribuidor
     */
    editDistribuidor(distribuidor: Distribuidor): void {
        this.selectedDistribuidor = distribuidor;

        // Go to the new distribuidor
        this._router.navigate(['./', distribuidor.id], { relativeTo: this._activatedRoute });

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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Contactenos, ContactenosPaginator } from '../contactenos';
import { GestionContactenosService } from '../gestion-contactenos.service';
import { MatPaginator } from '@angular/material/paginator';
import { Paginator } from '../../paginator';

@Component({
    selector: 'gestion-contactenos-list',
    templateUrl: './gestion-contactenos-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionContactenosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    contactenosPaginator$: Observable<ContactenosPaginator>;

    contactenosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedContactenos: Contactenos;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'identificacion', 'nombres', 'apellidos', 'correo', 'telefono', 'estado'];

    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    cantidad: number;

    searchStrAbiertas$ = new BehaviorSubject<string>('');
    loadData: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionContactenosService: GestionContactenosService,
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
        // Get the contactenoss
        this.contactenosPaginator$ = this._gestionContactenosService.contactenosPaginator$;
        this._gestionContactenosService.contactenosPaginator$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contactenosPaginator: ContactenosPaginator) => {

                // Update the counts
                this.contactenosCount = contactenosPaginator.cantidad;

                // Store the table data
                this.recentTransactionsDataSource.data = contactenosPaginator.registros;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the contactenos
        this._gestionContactenosService.contactenos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contactenos: Contactenos) => {

                // Update the selected contactenos 
                this.selectedContactenos = contactenos;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contactenos  when drawer closed
                this.selectedContactenos = null;

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
                this.createContactenos();
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
        // Search
        this._gestionContactenosService.getContactenosPaginator(paginator).subscribe(data => {

            // Update the counts
            this.contactenosCount = data.cantidad;

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
     * Create contactenos
     */
    createContactenos(): void {
        // Go to the new contactenos
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create contactenos
     */
    editContactenos(contactenos: Contactenos): void {

        this.selectedContactenos = contactenos;

        // Go to the new contactenos
        this._router.navigate(['./', contactenos.id], { relativeTo: this._activatedRoute });

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

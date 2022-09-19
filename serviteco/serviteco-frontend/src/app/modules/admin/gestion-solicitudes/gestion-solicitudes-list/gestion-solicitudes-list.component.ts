import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RecepcionSolicitud } from '../recepcion-solicitud';
import { GestionSolicitudesService } from '../gestion-solicitudes.service';

@Component({
    selector: 'gestion-solicitudes-list',
    templateUrl: './gestion-solicitudes-list.component.html',

    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionSolicitudesListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    solicitudes$: Observable<RecepcionSolicitud[]>;

    solicitudesCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selected: RecepcionSolicitud;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    tableColumns: string[] = ['id', 'tipo_recepcion', 'producto', 'categoria', 'marca', 'referencia', 'identificacion', 'nombres', 'apellidos', 'telefono', 'fecha_ingreso', 'asignado', 'cargo', 'company', 'estado_actual'];

    orderBy: string = "id";
    order: string = "desc";
    filter: string = "all";
    pageIndex: string = "0";
    pageSize: string = "10";
    pageSizeInit = 10;

    searchStr$ = new BehaviorSubject<string>('');
    loadData: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionSolicitudesService: GestionSolicitudesService,
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
        this.dataSource.sort = this.sort;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the solicitud
        this.solicitudes$ = this._gestionSolicitudesService.solicitudes$;
        this._gestionSolicitudesService.solicitudes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((solicitudes: RecepcionSolicitud[]) => {

                // Update the counts
                this.solicitudesCount = solicitudes.length;

                // Store the table data
                this.dataSource.data = solicitudes;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.dataSource.sort = this.sort;

        // Get the solicitud
        this._gestionSolicitudesService.solicitud$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((solicitud: RecepcionSolicitud) => {

                // Update the selected solicitud
                this.selected = solicitud;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected solicitud when drawer closed
                this.selected = null;

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
                this.createSolicitud();
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

    applyFilter(filterValue: string): void {
        this.filter = filterValue;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        this.solicitudesCount = this.dataSource.filteredData.length;
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
     * Create solicitud
     */
    createSolicitud(): void {
        // Go to the new solicitud
        //this._router.navigate(['/crear-solicitud', 0]);

        this._router.navigateByUrl('/crear-solicitud');

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create solicitud
     */
    editSolicitud(solicitud: RecepcionSolicitud): void {

        this.selected = solicitud;

        // Go to the new solicitud
        this._router.navigate(['./', solicitud.uuid], { relativeTo: this._activatedRoute });

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

}

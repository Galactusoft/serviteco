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
import { UsuarioFinal } from '../usuario-final';
import { GestionUsuarioFinalService } from '../gestion-usuario-final.service';

@Component({
    selector: 'gestion-usuario-final-list',
    templateUrl: './gestion-usuario-final-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuarioFinalListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    usuariosFinales$: Observable<UsuarioFinal[]>;

    usuarioFinalCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedUsuario: UsuarioFinal;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'identificacion', 'nombres', 'apellidos', 'direccion', 'telefono'];

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
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
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
        // Get the usuarioFinal
        this.usuariosFinales$ = this._gestionUsuarioFinalService.usuariosFinales$;
        this._gestionUsuarioFinalService.usuariosFinales$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuarioFinal: UsuarioFinal[]) => {

                // Update the counts
                this.usuarioFinalCount = usuarioFinal.length;

                // Store the table data
                this.recentTransactionsDataSource.data = usuarioFinal;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the usuario
        this._gestionUsuarioFinalService.usuarioFinal$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: UsuarioFinal) => {

                // Update the selected usuario
                this.selectedUsuario = usuario;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected usuario when drawer closed
                this.selectedUsuario = null;

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
                this.createUsuario();
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
        this.recentTransactionsDataSource.filter = filterValue.trim().toLowerCase();
        this.usuarioFinalCount = this.recentTransactionsDataSource.filteredData.length;
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
    createUsuario(): void {
        // Go to the new usuario
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create usuario
     */
    editUsuario(usuario: UsuarioFinal): void {

        this.selectedUsuario = usuario;

        // Go to the new usuario
        this._router.navigate(['./', usuario.id], { relativeTo: this._activatedRoute });

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

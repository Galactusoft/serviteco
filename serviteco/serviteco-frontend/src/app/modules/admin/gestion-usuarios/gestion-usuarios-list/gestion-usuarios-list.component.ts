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
import { Usuario } from '../usuarios';
import { GestionUsuariosService } from '../gestion-usuarios.service';
import { GestionReportesService } from 'app/shared/gestion-reportes.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-usuarios-list',
    templateUrl: './gestion-usuarios-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuariosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    usuarios$: Observable<Usuario[]>;

    usuariosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedUsuario: Usuario;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'username', 'nombre_completo', 'cargo', 'tipo_usuario', 'company', 'jefe_taller', 'activo'];

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
            property: 'name',
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
            label: 'Correo electrónico',
            property: 'email',
            type: 'text',
            cssClasses: ['font-medium', 'w-30', 'min-w-30'],
        },
    ];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionUsuariosService: GestionUsuariosService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
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
        // Get the usuarios
        this.usuarios$ = this._gestionUsuariosService.usuarios$;
        this._gestionUsuariosService.usuarios$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuarios: Usuario[]) => {

                // Update the counts
                this.usuariosCount = usuarios.length;

                // Store the table data
                this.recentTransactionsDataSource.data = usuarios;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the usuario
        this._gestionUsuariosService.usuario$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: Usuario) => {

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

    consultarData() {
        // Search
        this._gestionUsuariosService.searchUsuario(this.filter || 'all', this.pageIndex, this.pageSize, this.orderBy, this.order).subscribe(data => {

            // Update the counts
            this.usuariosCount = JSON.parse(JSON.stringify(data)).totalElements;

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
        this.usuariosCount = this.recentTransactionsDataSource.filteredData.length;
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
    editUsuario(usuario: Usuario): void {

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

    exportar() {
        var head = ['Código', 'Usuario', 'Nombre completo', 'Tipo Usuario', 'Correo', 'Teléfono', 'Compañia', 'Jefe Taller', 'Cargo', 'Estado'];
        this._gestionUsuariosService.getUsuariosExport().subscribe(listado => {
            if (listado.length > 0) {
                this._gestionReportesService.exportAsExcelFile(listado, 'usuarios_', head, 0);
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

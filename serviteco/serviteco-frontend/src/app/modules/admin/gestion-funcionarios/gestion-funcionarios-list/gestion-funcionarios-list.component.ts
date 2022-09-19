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
import { Funcionario } from '../funcionarios';
import { GestionFuncionariosService } from '../gestion-funcionarios.service';

@Component({
    selector: 'gestion-funcionario-list',
    templateUrl: './gestion-funcionarios-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionFuncionariosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    funcionarios$: Observable<Funcionario[]>;

    funcionariosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedFuncionario: Funcionario;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatSort) sort: MatSort;

    data: any;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'nombre_completo', 'identificacion', 'correo' , 'telefono', 'cargo','estado'];

    orderBy: string = "id";
    order: string = "desc";
    filter: string = "all";
    pageIndex: string = "0";
    pageSize: string = "10";
    pageSizeInit = 10;
    loadData: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionFuncionariosService: GestionFuncionariosService,
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
        // Get the funcionarios
        this.funcionarios$ = this._gestionFuncionariosService.funcionarios$;
        this._gestionFuncionariosService.funcionarios$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((funcionarios: Funcionario[]) => {

                // Update the counts
                this.funcionariosCount = funcionarios.length;

                // Store the table data
                this.recentTransactionsDataSource.data = funcionarios;

                this.loadData = true;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.recentTransactionsDataSource.sort = this.sort;

        // Get the funcionario
        this._gestionFuncionariosService.funcionario$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((funcionario: Funcionario) => {

                // Update the selected funcionario 
                this.selectedFuncionario = funcionario;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected funcionario  when drawer closed
                this.selectedFuncionario = null;

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
                this.createFuncionario();
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
        this._gestionFuncionariosService.searchFuncionario(this.filter || 'all', this.pageIndex, this.pageSize, this.orderBy, this.order).subscribe(data => {

            // Update the counts
            this.funcionariosCount = JSON.parse(JSON.stringify(data)).totalElements;

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
        this.funcionariosCount = this.recentTransactionsDataSource.filteredData.length;
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
    createFuncionario(): void {
        // Go to the new funcionario
        this._router.navigate(['./', 0], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create funcionario
     */
    editFuncionario(funcionario: Funcionario): void {

        this.selectedFuncionario = funcionario;

        // Go to the new funcionario
        this._router.navigate(['./', funcionario.id], { relativeTo: this._activatedRoute });

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

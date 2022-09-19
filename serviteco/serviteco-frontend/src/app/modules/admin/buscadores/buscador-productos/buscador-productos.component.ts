import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { GestionProductosService } from '../../gestion-productos/gestion-productos.service';
import { Producto } from '../../gestion-productos/productos';
import { Paginator } from '../../paginator';

@Component({
    selector: 'buscador-productos',
    templateUrl: './buscador-productos.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorProductosComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Producto> | null;
    displayedColumns = ['id', 'nombre', 'descripcion'];
    seleccion: Producto;
    cantidad: number;
    productos$ = this._gestionProductosService.productoPaginator$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));

    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorProductosComponent>,
        private _formBuilder: FormBuilder,
        private _gestionProductosService: GestionProductosService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.dataSource = new MatTableDataSource();

        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;

        this.productos$ = this._gestionProductosService.getProductoPaginator(paginator);

        this.productos$.subscribe(item => {
            this.dataSource.data = item.registros;
            this.cantidad =item.cantidad;
        });

        this.searchStr$.subscribe((busqueda) => {
            this.dataSource.filter = (busqueda || '').trim().toLowerCase();
        });

        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    selectProducto(producto: Producto): void {
        this.seleccion = producto;
    }

    /**
     * Aceptar
     */
    aceptar(): void {

        // Close the dialog
        this.matDialogRef.close();
    }


    /**
     * Cancelar
     */
    cancelar(): void {
        // Close the dialog
        this.matDialogRef.close();
    }

}

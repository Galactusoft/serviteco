import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { GestionProductosService } from '../../gestion-productos/gestion-productos.service';
import { Producto } from '../../gestion-productos/productos';
import { Paginator } from '../../paginator';

@Component({
    selector: 'buscador-avanzado-productos',
    templateUrl: './buscador-avanzado-productos.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorAvanzadoProductosComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Producto> | null;
    displayedColumns = ['id', 'nombre', 'descripcion', 'nombre_propietario', 'detalle'];
    seleccion: Producto;
    cantidad: number;
    paginatorQuery: Paginator
    productos$ = this._gestionProductosService.productoPaginatorAvanzado$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));
    externo: boolean = false;

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
        public matDialogRef: MatDialogRef<BuscadorAvanzadoProductosComponent>,
        private _formBuilder: FormBuilder,
        private _gestionProductosService: GestionProductosService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _router: Router,
    ) {
        this.paginatorQuery = _data.paginator;
        this.externo = _data.externo;
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

        this.productos$ = this._gestionProductosService.getProductoPaginatorAvanzado(this.paginatorQuery);

        this.productos$.subscribe(item => {
            this.dataSource.data = item.registros;
            this.cantidad =item.cantidad;
        });

        this.searchStr$.subscribe((busqueda) => {
            this.dataSource.filter = (busqueda || '').trim().toLowerCase();
        });

        this._changeDetectorRef.markForCheck();
    }

    verDetalleProducto(producto: Producto) {
        // Go to the new solicitud
        //this._router.navigate(['/crear-solicitud', 0]);

        // Close the dialog
        this.matDialogRef.close();

        if (this.externo) {
            //this._router.navigate(['/info-producto', producto.id]);
            window.open("/#/info-producto/"+producto.id, "_blank");
        } else {
            this._router.navigate(['/detalle-producto', producto.id]);
        }

        // Mark for check
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

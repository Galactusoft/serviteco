import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { GestionTipoProductosService } from '../../gestion-tipoProductos/gestion-tipoProductos.service';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';

@Component({
    selector: 'buscador-categorias',
    templateUrl: './buscador-categorias.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorCategoriasComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<TipoProducto> | null;
    displayedColumns = ['id', 'nombre', 'descripcion'];
    seleccion: TipoProducto;
    cantidad: number;
    categorias$ = this._gestionTipoProductoService.tipoProductos$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorCategoriasComponent>,
        private _formBuilder: FormBuilder,
        private _gestionTipoProductoService: GestionTipoProductosService,
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

        this.categorias$ = this._gestionTipoProductoService.getTipoProductos();

        this.categorias$.subscribe(item => {
            this.dataSource.data = item;
        });

        this.searchStr$.subscribe((busqueda) => {
            this.dataSource.filter = (busqueda || '').trim().toLowerCase();
        });

        this._changeDetectorRef.markForCheck();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    selectCategoria(categoria: TipoProducto): void {
        this.seleccion = categoria;
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

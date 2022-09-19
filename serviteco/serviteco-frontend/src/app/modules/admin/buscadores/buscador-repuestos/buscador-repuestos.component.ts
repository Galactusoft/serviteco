import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { GestionRepuestosService } from '../../gestion-repuestos/gestion-repuestos.service';
import { Repuesto } from '../../gestion-repuestos/repuestos';
import { Paginator } from '../../paginator';

@Component({
    selector: 'buscador-repuestos',
    templateUrl: './buscador-repuestos.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorRepuestosComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    displayedColumns = ['material', 'pieza_fabricante', 'nombre', 'descripcion', 'marca'];
    seleccion: Repuesto;
    cantidad: number;
    repuestoPaginator$ = this._gestionRepuestosService.repuestoPaginator$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));
    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    idMarca: string;
    idCategoria: string;
    idReferencia: string;
    listadoRepuestos: Repuesto[] = [];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorRepuestosComponent>,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _gestionRepuestosService: GestionRepuestosService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this.idMarca = _data.id_marca;
        this.idCategoria = _data.id_categoria;
        this.idReferencia = _data.id_referencia;
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
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        paginator.id_marca = this.idMarca;
        paginator. id_categoria = this.idCategoria;
        paginator. id_referencia = this.idReferencia;
        this.repuestoPaginator$ = this._gestionRepuestosService.getRepuestoPaginatorAvanzado(paginator);

        this.repuestoPaginator$.subscribe(item => {
            this.listadoRepuestos = item.registros;
            this.cantidad = item.cantidad;
        });

        this.searchStr$.subscribe((busqueda) => {
            this.filter = (busqueda || 'all').trim().toLowerCase();
            this.paginator.firstPage();
            this.consultarData();

        });

        this._changeDetectorRef.markForCheck();
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
        paginator.id_marca = this.idMarca;
        paginator. id_categoria = this.idCategoria;
        paginator. id_referencia = this.idReferencia;
        // Search
        this._gestionRepuestosService.getRepuestoPaginatorAvanzado(paginator).subscribe(data => {

            // Update the counts
            this.cantidad = data.cantidad;

            this.listadoRepuestos = data.registros;
            
        });
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
        this.paginator.firstPage();
        this.consultarData();
        event.stopPropagation();
    }

    selectRepuesto(repuesto: Repuesto): void {
        this.seleccion = repuesto;
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

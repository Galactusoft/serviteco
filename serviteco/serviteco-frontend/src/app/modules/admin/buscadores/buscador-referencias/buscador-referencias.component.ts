import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { GestionReferenciasService } from '../../gestion-referencias/gestion-referencias.service';
import { Referencia } from '../../gestion-referencias/referencias';

@Component({
    selector: 'buscador-referencias',
    templateUrl: './buscador-referencias.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorReferenciasComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Referencia> | null;
    displayedColumns = ['id', 'nombre', 'descripcion', 'nombre_marca', 'nombre_importador'];
    seleccion: Referencia;
    cantidad: number;
    referencias$ = this._gestionReferenciasService.referencias$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));
    idTipoProducto: string;
    idImportador: string;
    idMarca: string;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorReferenciasComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _gestionReferenciasService: GestionReferenciasService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this.idTipoProducto = _data.idTipoProducto;
        this.idImportador = _data.idImportador;
        this.idMarca = _data.idMarca;
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

        if (null != this.idTipoProducto && null != this.idImportador && null != this.idMarca) {
            this.referencias$ = this._gestionReferenciasService.getReferenciasPorTipoImportador(this.idTipoProducto, this.idImportador, this.idMarca);
        } else if (null != this.idTipoProducto) {
            this.referencias$ = this._gestionReferenciasService.getReferenciasPorTipo(this.idTipoProducto);
        } else {
            this.referencias$ = this._gestionReferenciasService.getReferencias();
        }

        this.referencias$.subscribe(item => {
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

    selectReferencia(referencia: Referencia): void {
        this.seleccion = referencia;
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

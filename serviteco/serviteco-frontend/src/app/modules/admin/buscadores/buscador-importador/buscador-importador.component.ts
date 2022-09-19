import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { GestionImportadoresService } from '../../gestion-importadores/gestion-importadores.service';
import { Importador } from '../../gestion-importadores/importadores';

@Component({
    selector: 'buscador-importador',
    templateUrl: './buscador-importador.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorImportadorasComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Importador> | null;
    displayedColumns = ['id', 'nit', 'nombre'];
    seleccion: Importador;
    cantidad: number;
    importadoras$ = this._gestionImportadoresService.importadores$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));
    idTaller: string;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorImportadorasComponent>,
        private _formBuilder: FormBuilder,
        private _gestionImportadoresService: GestionImportadoresService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
    ) {
        this.idTaller = _data?.idTaller;
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

        if ('null' != this.idTaller && null != this.idTaller && '0' != this.idTaller) {
            this.importadoras$ = this._gestionImportadoresService.getImportadorasPorTaller(this.idTaller);
        } else {
            this.importadoras$ = this._gestionImportadoresService.getImportadores();
        }

        this.importadoras$.subscribe(item => {
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

    selectImportador(importador: Importador): void {
        this.seleccion = importador;
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

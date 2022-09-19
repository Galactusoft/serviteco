import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { Talleres } from '../../gestion-talleres/talleres';
import { GestionTalleresService } from '../../gestion-talleres/gestion-talleres.service';

@Component({
    selector: 'buscador-talleres',
    templateUrl: './buscador-talleres.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorTalleresComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Talleres> | null;
    displayedColumns = ['id', 'nit', 'nombre'];
    seleccion: Talleres;
    cantidad: number;
    talleres$ = this._gestionTalleresService.talleres$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));
    idImportador: string;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorTalleresComponent>,
        private _formBuilder: FormBuilder,
        private _gestionTalleresService: GestionTalleresService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
    ) {
        this.idImportador = _data?.idImportador;
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

        if ('null' != this.idImportador && null != this.idImportador) {
            this.talleres$ = this._gestionTalleresService.getTalleresImportadorAutorizado(this.idImportador);
        } else {
            this.talleres$ = this._gestionTalleresService.getTalleres();
        }

        this.talleres$.subscribe(item => {
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

    selectTaller(taller: Talleres): void {
        this.seleccion = taller;
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

import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { Distribuidor } from '../../gestion-distribuidores/distribuidores';
import { GestionDistribuidoresService } from '../../gestion-distribuidores/gestion-distribuidores.service';

@Component({
    selector: 'buscador-distribuidor',
    templateUrl: './buscador-distribuidor.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorDistribuidoresComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Distribuidor> | null;
    displayedColumns = ['id', 'nit', 'nombre'];
    seleccion: Distribuidor;
    cantidad: number;
    distribuidores$ = this._gestionDistribuidoresService.distribuidores$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorDistribuidoresComponent>,
        private _formBuilder: FormBuilder,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
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

        this.distribuidores$ = this._gestionDistribuidoresService.getDistribuidores();

        this.distribuidores$.subscribe(item => {
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

    selectDistribuidor(distribuidor: Distribuidor): void {
        this.seleccion = distribuidor;
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

import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { GestionManoObrasService } from '../../gestion-mano-obra/gestion-mano-obra.service';
import { ManoObra } from '../../gestion-mano-obra/mano-obra';

@Component({
    selector: 'buscador-mano-obra',
    templateUrl: './buscador-mano-obra.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorManoObraComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<ManoObra> | null;
    displayedColumns = ['id', 'nombre', 'descripcion', 'valor_unitario'];
    seleccion: ManoObra;
    cantidad: number;
    manoObras$ = this._gestionManoObrasService.manoObras$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorManoObraComponent>,
        private _formBuilder: FormBuilder,
        private _gestionManoObrasService: GestionManoObrasService,
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

        this.manoObras$ = this._gestionManoObrasService.getManoObras();

        this.manoObras$.subscribe(item => {
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

    selectManoObra(manoObra: ManoObra): void {
        this.seleccion = manoObra;
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

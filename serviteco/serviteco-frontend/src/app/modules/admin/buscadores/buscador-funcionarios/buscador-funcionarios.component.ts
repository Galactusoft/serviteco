import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Subject } from 'rxjs';
import { Funcionario } from '../../gestion-funcionarios/funcionarios';
import { GestionFuncionariosService } from '../../gestion-funcionarios/gestion-funcionarios.service';

@Component({
    selector: 'buscador-funcionarios',
    templateUrl: './buscador-funcionarios.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorFuncionariosComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Funcionario> | null;
    displayedColumns = ['id', 'nombre_completo', 'identificacion', 'cargo'];
    seleccion: Funcionario;
    cantidad: number;
    funcionarios$ = this._gestionFuncionariosService.funcionarios$;
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
        public matDialogRef: MatDialogRef<BuscadorFuncionariosComponent>,
        private _formBuilder: FormBuilder,
        private _gestionFuncionariosService: GestionFuncionariosService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
    ) {
        this.idTaller = _data.idTaller;
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

        this.funcionarios$ = this._gestionFuncionariosService.getUsuariosFuncionariosTaller(this.idTaller);

        this.funcionarios$.subscribe(item => {
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

    selectFuncionario(funcionario: Funcionario): void {
        this.seleccion = funcionario;
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

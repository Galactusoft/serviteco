import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { GestionUsuariosService } from '../../gestion-usuarios/gestion-usuarios.service';
import { Usuario } from '../../gestion-usuarios/usuarios';

@Component({
    selector: 'buscador-usuarios',
    templateUrl: './buscador-usuarios.component.html',
    encapsulation: ViewEncapsulation.None
})
export class BuscadorUsuariosComponent implements OnInit, AfterViewInit {

    dataSource: MatTableDataSource<Usuario> | null;
    displayedColumns = ['id', 'nombres', 'apellidos','correo','telefono'];
    seleccion: Usuario;
    cantidad: number;
    usuarios$ = this._gestionUsuariosService.usuarios$;
    searchCtrl = new FormControl('');
    searchStr$ = this.searchCtrl.valueChanges.pipe(debounceTime(10));

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    private _unsubscribeAll: Subject<any> = new Subject<any>();



    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<BuscadorUsuariosComponent>,
        private _formBuilder: FormBuilder,
        private _gestionUsuariosService: GestionUsuariosService,
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

        this.usuarios$ = this._gestionUsuariosService.getUsuariosPorTipoUsuario("estudiante");
        //this.usuarios$ = this._gestionUsuariosService.usuarios$;

        this.usuarios$.subscribe(item => {
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

    selectUsuario(usuario: Usuario): void {
        this.seleccion = usuario;
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

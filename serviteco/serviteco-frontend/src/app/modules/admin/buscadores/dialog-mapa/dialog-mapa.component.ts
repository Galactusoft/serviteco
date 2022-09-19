import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseAlertType } from '@fuse/components/alert';
import { GestionUsuariosService } from '../../gestion-usuarios/gestion-usuarios.service';
import { MouseEvent } from '@agm/core';
import { Ubicacion } from './ubicacion';

@Component({
    selector: 'dialog-mapa',
    templateUrl: './dialog-mapa.component.html',
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
        .map-container {
            flex-grow: 1;
            width: 60em;
            height: 80vh;
        }
        `
    ],
})

export class DialogMapaComponent implements OnInit, AfterViewInit {

    idUsuario: string;
    passwordForm: FormGroup;
    showAlert: boolean = false;
    // initial center position for the map
    lat: number = 2.6434379;
    lng: number = -76.52959871;
    zoom: number = 5.5;

    alert: { type: FuseAlertType; message: string } = {
        type: 'info',
        message: ''
    };

    seleccion: Ubicacion;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<DialogMapaComponent>,
        private _formBuilder: FormBuilder,
        private _gestionUsuariosService: GestionUsuariosService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private _data: any,
    ) {
        this.lat = _data.latitud;
        this.lng = _data.longitud;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {

    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.passwordForm = this._formBuilder.group({
            password: [null],
            rePassword: [null],
        });

        this._changeDetectorRef.markForCheck();
    }

    mapClicked($event: MouseEvent): void {
        this.lat = $event.coords.lat;
        this.lng = $event.coords.lng;
        this.seleccion = new Ubicacion();
        this.seleccion.lat = this.lat;
        this.seleccion.lon = this.lng;
    }

    clickedMarker(lat: number, lng: number): void {
        
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Cancelar
     */
    cancelar(): void {
        // Close the dialog
        this.matDialogRef.close();
    }

}

import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseAlertType } from '@fuse/components/alert';
import Swal from 'sweetalert2';
import { GestionUsuarioFinalService } from '../../gestion-usuario-final/gestion-usuario-final.service';
import { UsuarioFinal } from '../../gestion-usuario-final/usuario-final';
import { GestionUsuariosService } from '../../gestion-usuarios/gestion-usuarios.service';
import { DialogMapaComponent } from '../dialog-mapa/dialog-mapa.component';
import { Ubicacion } from '../dialog-mapa/ubicacion';

@Component({
    selector: 'dialog-usuario-final',
    templateUrl: './dialog-usuario-final.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DialogUsuarioFinalComponent implements OnInit, AfterViewInit {

    idUsuario: string;
    usuarioFinalForm: FormGroup;
    showAlert: boolean = false;
    existeUsuario: boolean = false;
    usuarioFinal: UsuarioFinal;

    alert: { type: FuseAlertType; message: string } = {
        type: 'info',
        message: ''
    };

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<DialogUsuarioFinalComponent>,
        private _formBuilder: FormBuilder,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
    ) {

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
        this.usuarioFinalForm = this._formBuilder.group({
            id: [null],
            nombres: [null],
            apellidos: [null],
            identificacion: [null],
            telefono: [null],
            direccion: [null],
            codigo_postal: [null],
            correo: ['', [Validators.required, Validators.email]],
            ubicacion: [null],
            latitud: [null],
            longitud: [null],
        });

        this._changeDetectorRef.markForCheck();
    }

    consultarUsuarioFinal(identificacion: string): void {
        this._gestionUsuarioFinalService.getUsuarioFinalByIdentificacion(identificacion).subscribe(res => {
            if (null != res) {
                Swal.fire({
                    title: 'Usuario encontrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                this.usuarioFinalForm.get('id').setValue(res.id);
                this.usuarioFinalForm.get('nombres').setValue(res.nombres);
                this.usuarioFinalForm.get('apellidos').setValue(res.apellidos);
                this.usuarioFinalForm.get('identificacion').setValue(res.identificacion);
                this.usuarioFinalForm.get('telefono').setValue(res.telefono);
                this.usuarioFinalForm.get('direccion').setValue(res.direccion);
                this.usuarioFinalForm.get('codigo_postal').setValue(res.codigo_postal);
                this.usuarioFinalForm.get('correo').setValue(res.correo);
                this.existeUsuario = true;
            } else {
                Swal.fire({
                    title: 'No existe usuario registrado con el número de identificación registrado',
                    icon: 'error',
                    timer: 1500
                })
                this.usuarioFinalForm.get('id').setValue(null);
                this.usuarioFinalForm.get('nombres').setValue(null);
                this.usuarioFinalForm.get('apellidos').setValue(null);
                this.usuarioFinalForm.get('telefono').setValue(null);
                this.usuarioFinalForm.get('direccion').setValue(null);
                this.usuarioFinalForm.get('codigo_postal').setValue(null);
                this.usuarioFinalForm.get('correo').setValue(null);
                this.existeUsuario = false;
            }
            this._changeDetectorRef.markForCheck();
        })
    }

    registrarUsurioFinal() {
        const usuarioFinal = this.usuarioFinalForm.getRawValue();
        if (this.existeUsuario) {
            this.matDialogRef.close(['accept', usuarioFinal])
        } else {
            if (usuarioFinal.id == null) {
                this._gestionUsuarioFinalService.createUsuarioFinal(usuarioFinal).subscribe(res => {
                    Swal.fire({
                        title: 'Usuario registrado exitosamente!',
                        icon: 'info',
                        timer: 1000
                    })
                    this.matDialogRef.close(['accept', res])
                })
            } else {
                this.openSnackBar("Las contraseñas no coinciden", "Cerrar");
                this.showAlert = true;
            }
        }

    }

    /**
        * Open mapa dialog
        */
    openMapa(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(DialogMapaComponent, {
            data: {
                latitud: Number(123456),
                longitud: Number(123456)
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Ubicacion = result[1];
                this.usuarioFinalForm.get('ubicacion').setValue(selected.lat + " / " + selected.lon);
                this.usuarioFinalForm.get('latitud').setValue(selected.lat);
                this.usuarioFinalForm.get('longitud').setValue(selected.lon);
            });
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

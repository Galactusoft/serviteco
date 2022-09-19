import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseAlertType } from '@fuse/components/alert';
import { GestionUsuariosService } from '../../gestion-usuarios/gestion-usuarios.service';

@Component({
    selector: 'dialog-password',
    templateUrl: './dialog-password.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DialogPasswordComponent implements OnInit, AfterViewInit {

    idUsuario: string;
    passwordForm: FormGroup;
    showAlert: boolean = false;

    alert: { type: FuseAlertType; message: string } = {
        type: 'info',
        message: ''
    };

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<DialogPasswordComponent>,
        private _formBuilder: FormBuilder,
        private _gestionUsuariosService: GestionUsuariosService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _snackBar: MatSnackBar
    ) {
        this.idUsuario = _data.idUsuario;
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

    cambiarPassword() {
        const password = this.passwordForm.get('password').value;
        const rePassword = this.passwordForm.get('rePassword').value;

        if (password == rePassword) {
            this._gestionUsuariosService.actualizarPassword(password, this.idUsuario).subscribe(res => {
                this.openSnackBar("Contraseña actualizada exitosamente", "Cerrar");
                this.matDialogRef.close();
            })
        } else {
            this.openSnackBar("Las contraseñas no coinciden", "Cerrar");
            this.showAlert = true;
        }
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

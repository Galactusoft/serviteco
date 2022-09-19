import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { GestionUsuarioFinalListComponent } from '../gestion-usuario-final-list/gestion-usuario-final-list.component';
import { GestionUsuarioFinalService } from '../gestion-usuario-final.service';
import { UsuarioFinal } from '../usuario-final';

@Component({
    selector: 'gestion-usuario-final-detail',
    templateUrl: './gestion-usuario-final-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuarioFinalDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    usuario: UsuarioFinal;
    usuarioForm: FormGroup;
    usuariosFinales: UsuarioFinal[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionUsuarioFinalListComponent: GestionUsuarioFinalListComponent,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _snackBar: MatSnackBar,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._gestionUsuarioFinalListComponent.matDrawer.open();

        // Create the usuario form
        this.usuarioForm = this._formBuilder.group({
            id: [''],
            identificacion: [null],
            nombres: [''],
            apellidos: [''],
            direccion: [''],
            telefono: [''],
            correo: ['', [Validators.required, Validators.email]],
            codigo_postal: [''],
        });

        // Get the usuario
        this._gestionUsuarioFinalService.usuariosFinales$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuarioFinal: UsuarioFinal[]) => {
                this.usuariosFinales = usuarioFinal;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the usuario
        this._gestionUsuarioFinalService.usuarioFinal$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: UsuarioFinal) => {

                // Open the drawer in case it is closed
                this._gestionUsuarioFinalListComponent.matDrawer.open();

                // Get the usuario
                this.usuario = usuario;

                if (usuario != null) {
                    this.editPassword = true;

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.editPassword = false;
                    this.usuarioForm.reset();
                    usuario = new UsuarioFinal();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.usuarioForm.patchValue(usuario);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._gestionUsuarioFinalListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the usuario
     */
    updateUsuario(): void {
        // Get the usuario object
        const usuario = this.usuarioForm.getRawValue();

        if (usuario.id == null) {
            // Update the usuario on the server
            this._gestionUsuarioFinalService.registroUsuarioFinal(usuario).subscribe(() => {

                Swal.fire({
                    title: 'Usuario final registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-usuario-final']);
            });
        } else {
            // Update the usuario on the server
            this._gestionUsuarioFinalService.updateUsuarioFinal(usuario.id, usuario).subscribe(() => {

                Swal.fire({
                    title: 'Usuario final modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-usuario-final']);
            });
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

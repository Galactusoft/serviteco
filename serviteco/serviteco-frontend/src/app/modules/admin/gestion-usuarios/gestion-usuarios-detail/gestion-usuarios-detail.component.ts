import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Usuario } from '../usuarios';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionUsuariosListComponent } from '../gestion-usuarios-list/gestion-usuarios-list.component';
import { GestionUsuariosService } from '../gestion-usuarios.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { BuscadorFuncionariosComponent } from '../../buscadores/buscador-funcionarios/buscador-funcionarios.component';
import { Funcionario } from '../../gestion-funcionarios/funcionarios';
import { BuscadorImportadorasComponent } from '../../buscadores/buscador-importador/buscador-importador.component';
import { Importador } from '../../gestion-importadores/importadores';
import { BuscadorDistribuidoresComponent } from '../../buscadores/buscador-distribuidor/buscador-distribuidor.component';
import { Distribuidor } from '../../gestion-distribuidores/distribuidores';
import Swal from 'sweetalert2';
import { BuscadorTalleresComponent } from '../../buscadores/buscador-talleres/buscador-talleres.component';
import { Talleres } from '../../gestion-talleres/talleres';

@Component({
    selector: 'gestion-usuarios-detail',
    templateUrl: './gestion-usuarios-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuariosDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    usuario: Usuario;
    usuarioForm: FormGroup;
    usuarios: Usuario[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    noEditaUsername: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionUsuariosListComponent: GestionUsuariosListComponent,
        private _gestionUsuariosService: GestionUsuariosService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
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
        this._gestionUsuariosListComponent.matDrawer.open();

        // Create the usuario form
        this.usuarioForm = this._formBuilder.group({
            id: [''],
            username: [null],
            tipo_usuario: [''],
            tipo_funcionario: [''],
            nombre_completo: [''],
            identificacion: [''],
            correo: ['', [Validators.required, Validators.email]],
            telefono: [''],
            cargo: [''],
            jefe_taller: ['NO'],
            id_importador: [''],
            nombre_importador: [''],
            id_distribuidor: [''],
            nombre_distribuidor: [''],
            id_funcionario: [''],
            nombre_funcionario: [''],
            id_taller: [''],
            nombre_taller: [''],
            identificacion_funcionario: [''],
            estado: [''],
            fecha_sistema: [''],
        });

        // Get the usuario
        this._gestionUsuariosService.usuarios$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuarios: Usuario[]) => {
                this.usuarios = usuarios;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the usuario
        this._gestionUsuariosService.usuario$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: Usuario) => {

                // Open the drawer in case it is closed
                this._gestionUsuariosListComponent.matDrawer.open();

                // Get the usuario
                this.usuario = usuario;

                if (usuario != null) {
                    usuario.password = "";
                    this.editPassword = true;
                    this.noEditaUsername = true;

                    this._gestionUsuariosService.getFile(usuario.id).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                        this._changeDetectorRef.markForCheck();
                    });

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.noEditaUsername = false;
                    this.editPassword = false;
                    this.usuarioForm.reset();
                    usuario = new Usuario();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.usuarioForm.patchValue(usuario);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    selectTipoUsuario() {
        if (this.usuarioForm.get('tipo_usuario').value === 'funcionario') {
            this.usuarioForm.get('tipo_funcionario').setValue("taller autorizado");
            this.usuarioForm.get('jefe_taller').setValue("NO");
        } else {
            this.usuarioForm.get('tipo_funcionario').setValue(null);
            this.usuarioForm.get('jefe_taller').setValue("NO");

            this.usuarioForm.controls['nombre_taller'].setErrors(null);
            this.usuarioForm.controls.nombre_taller.clearValidators()
            this.usuarioForm.controls.nombre_taller.setErrors(null);
        }
        this.usuarioForm.get('id_funcionario').setValue(null);
        this.usuarioForm.get('identificacion_funcionario').setValue(null);
        this.usuarioForm.get('id_importador').setValue(null);
        this.usuarioForm.get('nombre_importador').setValue(null);
        this.usuarioForm.controls['nombre_importador'].setErrors(null);
        this.usuarioForm.controls.nombre_importador.clearValidators()
        this.usuarioForm.controls.nombre_importador.setErrors(null);
        this.usuarioForm.get('id_distribuidor').setValue(null);
        this.usuarioForm.get('nombre_distribuidor').setValue(null);
        this.usuarioForm.controls['nombre_distribuidor'].setErrors(null);
        this.usuarioForm.controls.nombre_distribuidor.clearValidators()
        this.usuarioForm.controls.nombre_distribuidor.setErrors(null);
        this.usuarioForm.get('id_taller').setValue(null);
        this.usuarioForm.get('nombre_taller').setValue(null);
    }

    selectTipoFuncionario() {
        this.usuarioForm.get('id_funcionario').setValue(null);
        this.usuarioForm.get('nombre_completo').setValue(null);
        this.usuarioForm.get('identificacion_funcionario').setValue(null);
        this.usuarioForm.get('username').setValue(null);
        this.usuarioForm.get('id_importador').setValue(null);
        this.usuarioForm.get('nombre_importador').setValue(null);
        this.usuarioForm.get('id_distribuidor').setValue(null);
        this.usuarioForm.get('nombre_distribuidor').setValue(null);
        this.usuarioForm.get('id_taller').setValue(null);
        this.usuarioForm.get('nombre_taller').setValue(null);
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
        return this._gestionUsuariosListComponent.matDrawer.close();
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

    validarUsername(username: string) {
        this._gestionUsuariosService.validarUsername(username).subscribe(rpta => {
            if (rpta['resultado'] == 'ERROR') {
                this.usuarioForm.get('username').setValue(null);
                Swal.fire({
                    title: 'Usuario ya existe en el sistema!',
                    icon: 'error',
                    timer: 1500
                })
            }
        });
    }

    /**
     * Update the usuario
     */
    updateUsuario(): void {
        // Get the usuario object
        const usuario = this.usuarioForm.getRawValue();
        usuario.password = usuario.identificacion;

        if (usuario.jefe_taller == null || usuario.jefe_taller == '' || usuario.jefe_taller == 'null') {
            this.usuarioForm.get('jefe_taller').setValue("NO");
            usuario.jefe_taller = "NO";
        }

        if (usuario.id == null) {
            // Update the usuario on the server
            this._gestionUsuariosService.createUsuario(usuario).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', usuario.id);
                            this.file_data = formData
                            this._gestionUsuariosService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                Swal.fire({
                    title: 'Usuario registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-usuarios']);
            });
        } else {
            // Update the usuario on the server
            this._gestionUsuariosService.updateUsuario(usuario.id, usuario).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', usuario.id);
                            this.file_data = formData
                            this._gestionUsuariosService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                Swal.fire({
                    title: 'Usuario modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-usuarios']);
            });
        }
    }

    /**
    * Open funcionarios dialog
    */
    openBuscadorFuncionarios(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorFuncionariosComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Funcionario = result[1];
                this.usuarioForm.get('id_funcionario').setValue(selected.id);
                this.usuarioForm.get('nombre_completo').setValue(selected.nombre_completo);
                this.usuarioForm.get('identificacion_funcionario').setValue(selected.identificacion);
                this.usuarioForm.get('username').setValue(selected.identificacion);
            });
    }

    /**
    * Open importadores dialog
    */
    openBuscadorImportadores(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorImportadorasComponent, {
            data: {
                idTaller: localStorage.getItem('accessTaller')
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Importador = result[1];
                this.usuarioForm.get('id_importador').setValue(selected.id);
                this.usuarioForm.get('nombre_importador').setValue(selected.nombre);
            });
    }

    /**
    * Open distribuidoras dialog
    */
    openBuscadorDistribuidoras(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorDistribuidoresComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Distribuidor = result[1];
                this.usuarioForm.get('id_distribuidor').setValue(selected.id);
                this.usuarioForm.get('nombre_distribuidor').setValue(selected.nombre);
            });
    }

    /**
    * Open talleres dialog
    */
    openBuscadorTalleresAutorizados(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorTalleresComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Talleres = result[1];
                this.usuarioForm.get('id_taller').setValue(selected.id);
                this.usuarioForm.get('nombre_taller').setValue(selected.nombre);
            });
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.usuarioForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.usuarioForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
    * Open compose dialog
    */
    cambiarPassword() {
        // Open the dialog
        const dialogRef = this._matDialog.open(DialogPasswordComponent, {
            disableClose: true,
            data: {
                idUsuario: this.usuario.id,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['inicio']);
            });
    }


    /**
     * Delete the usuario
     */
    deleteUsuario(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar usuario',
            message: 'Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Eliminar'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current usuario's id
                const id = this.usuario.id;

                // Get the next/previous usuario's id
                const currentUsuarioIndex = this.usuarios.findIndex(item => item.id === id);
                const nextUsuarioIndex = currentUsuarioIndex + ((currentUsuarioIndex === (this.usuarios.length - 1)) ? -1 : 1);
                const nextUsuarioId = (this.usuarios.length === 1 && this.usuarios[0].id === id) ? null : this.usuarios[nextUsuarioIndex].id;

                // Delete the usuario
                this._gestionUsuariosService.deleteUsuario(id)
                    .subscribe((request) => {

                        // Return if the usuario wasn't deleted...
                        if (request['resultado'] == 'ERROR') {
                            Swal.fire({
                                title: request['mensaje'],
                                icon: 'error',
                                timer: 1500
                            })
                            return;
                        } else {
                            Swal.fire({
                                title: request['mensaje'],
                                icon: 'info',
                                timer: 1500
                            })
                        }



                        // Navigate to the next usuario if available
                        if (nextUsuarioId) {
                            this._router.navigate(['../', nextUsuarioId], { relativeTo: this._activatedRoute });
                        }
                        // Otherwise, navigate to the parent
                        else {
                            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
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

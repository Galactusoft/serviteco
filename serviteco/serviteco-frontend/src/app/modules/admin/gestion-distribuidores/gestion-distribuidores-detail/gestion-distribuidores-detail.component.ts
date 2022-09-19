import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Distribuidor } from '../distribuidores';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionDistribuidoresListComponent } from '../gestion-distribuidores-list/gestion-distribuidores-list.component';
import { GestionDistribuidoresService } from '../gestion-distribuidores.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogMapaComponent } from '../../buscadores/dialog-mapa/dialog-mapa.component';
import { Ubicacion } from '../../buscadores/dialog-mapa/ubicacion';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-distribuidores-detail',
    templateUrl: './gestion-distribuidores-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionDistribuidoresDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    distribuidor: Distribuidor;
    distribuidorForm: FormGroup;
    distribuidores: Distribuidor[];
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
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionDistribuidoresListComponent: GestionDistribuidoresListComponent,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
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
        this._gestionDistribuidoresListComponent.matDrawer.open();

        // Create the distribuidor form
        this.distribuidorForm = this._formBuilder.group({
            id: [''],
            nit: [null],
            nombre: [null],
            estado: [''],
            direccion: [''],
            telefono: [''],
            correo: ['', [Validators.required, Validators.email]],
            correo_contabilidad: ['', [Validators.required, Validators.email]],
            fecha_sistema: [''],
            foto: [''],
            ubicacion: [''],
            latitud: [''],
            longitud: [''],
        });

        // Get the distribuidor
        this._gestionDistribuidoresService.distribuidores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((distribuidores: Distribuidor[]) => {
                this.distribuidores = distribuidores;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the distribuidor
        this._gestionDistribuidoresService.distribuidor$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((distribuidor: Distribuidor) => {

                // Open the drawer in case it is closed
                this._gestionDistribuidoresListComponent.matDrawer.open();

                // Get the distribuidor
                this.distribuidor = distribuidor;

                if (distribuidor != null) {
                    this.editPassword = true;

                    if (distribuidor.latitud != null) {
                        this.distribuidorForm.get('ubicacion').setValue(distribuidor.latitud + " / " + distribuidor.longitud);
                    }

                    this._gestionDistribuidoresService.getFile(distribuidor.id).subscribe(img => {
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
                    this.imagenBase64 = "";
                    this.editPassword = false;
                    this.distribuidorForm.reset();
                    distribuidor = new Distribuidor();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.distribuidorForm.patchValue(distribuidor);

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
        return this._gestionDistribuidoresListComponent.matDrawer.close();
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
     * Update the distribuidor
     */
    updateDistribuidor(): void {
        // Get the distribuidor object
        const distribuidor = this.distribuidorForm.getRawValue();

        if (distribuidor.id == null) {
            // Update the distribuidor on the server
            this._gestionDistribuidoresService.createDistribuidor(distribuidor).subscribe((newDistribuidor) => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', newDistribuidor.id);
                            this.file_data = formData
                            this._gestionDistribuidoresService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Distribuidor registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-distribuidores']);
            });
        } else {
            // Update the distribuidor on the server
            this._gestionDistribuidoresService.updateDistribuidor(distribuidor.id, distribuidor).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', distribuidor.id);
                            this.file_data = formData
                            this._gestionDistribuidoresService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Distribuidor modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-distribuidores']);
            });
        }
    }

    adjuntarFoto(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.distribuidorForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.distribuidorForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }   

    /**
    * Open mapa dialog
    */
     openMapa(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(DialogMapaComponent, {
            data: {
                latitud: Number(this.distribuidorForm.get('latitud').value),
                longitud: Number(this.distribuidorForm.get('longitud').value)
            }
          });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Ubicacion = result[1];
                this.distribuidorForm.get('ubicacion').setValue(selected.lat + " / " + selected.lon);
                this.distribuidorForm.get('latitud').setValue(selected.lat);
                this.distribuidorForm.get('longitud').setValue(selected.lon);
            });
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
                idDistribuidor: this.distribuidor.id,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['admin-ifec']);
            });
    }


    /**
     * Delete the distribuidor
     */
    deleteDistribuidor(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar distribuidor',
            message: 'Está seguro de que desea eliminar este distribuidor? Esta acción no se puede deshacer!',
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
                // Get the current distribuidor's id
                const id = this.distribuidor.id;

                // Get the next/previous distribuidor's id
                const currentDistribuidorIndex = this.distribuidores.findIndex(item => item.id === id);
                const nextDistribuidorIndex = currentDistribuidorIndex + ((currentDistribuidorIndex === (this.distribuidores.length - 1)) ? -1 : 1);
                const nextDistribuidorId = (this.distribuidores.length === 1 && this.distribuidores[0].id === id) ? null : this.distribuidores[nextDistribuidorIndex].id;

                // Delete the distribuidor
                this._gestionDistribuidoresService.deleteDistribuidor(id)
                    .subscribe((isDeleted) => {

                        // Return if the distribuidor wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next distribuidor if available
                        if (nextDistribuidorId) {
                            this._router.navigate(['../', nextDistribuidorId], { relativeTo: this._activatedRoute });
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

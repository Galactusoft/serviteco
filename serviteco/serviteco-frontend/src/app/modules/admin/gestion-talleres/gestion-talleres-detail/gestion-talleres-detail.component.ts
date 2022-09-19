import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Talleres } from '../talleres';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionTalleresListComponent } from '../gestion-talleres-list/gestion-talleres-list.component';
import { GestionTalleresService } from '../gestion-talleres.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogMapaComponent } from '../../buscadores/dialog-mapa/dialog-mapa.component';
import { Ubicacion } from '../../buscadores/dialog-mapa/ubicacion';
import Swal from 'sweetalert2';
import { BuscadorImportadorasComponent } from '../../buscadores/buscador-importador/buscador-importador.component';
import { Importador } from '../../gestion-importadores/importadores';
import { GestionImportadoresService } from '../../gestion-importadores/gestion-importadores.service';

@Component({
    selector: 'gestion-talleres-detail',
    templateUrl: './gestion-talleres-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionTalleresDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    taller: Talleres;
    tallerForm: FormGroup;
    talleres: Talleres[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    listadoImportadoras: Importador[];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionTalleresListComponent: GestionTalleresListComponent,
        private _gestionTalleresService: GestionTalleresService,
        private _gestionImportadoresService: GestionImportadoresService,
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
        this.listadoImportadoras = [];
        // Open the drawer
        this._gestionTalleresListComponent.matDrawer.open();

        // Create the taller form
        this.tallerForm = this._formBuilder.group({
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

        // Get the taller
        this._gestionTalleresService.talleres$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((talleres: Talleres[]) => {
                this.talleres = talleres;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the taller
        this._gestionTalleresService.taller$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((taller: Talleres) => {

                // Open the drawer in case it is closed
                this._gestionTalleresListComponent.matDrawer.open();

                // Get the taller
                this.taller = taller;

                if (taller != null) {
                    this.editPassword = true;

                    if (taller.latitud != null) {
                        this.tallerForm.get('ubicacion').setValue(taller.latitud + " / " + taller.longitud);
                    }

                    this._gestionTalleresService.getFile(taller.id).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                        this._changeDetectorRef.markForCheck();
                    });

                    this._gestionImportadoresService.getImportadorasPorTaller(taller.id).subscribe(data => {
                        this.listadoImportadoras = data;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.listadoImportadoras = [];
                    this.imagenBase64 = "";
                    this.editPassword = false;
                    this.tallerForm.reset();
                    taller = new Talleres();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.tallerForm.patchValue(taller);

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
        return this._gestionTalleresListComponent.matDrawer.close();
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
     * Update the taller
     */
    updateTaller(): void {
        // Get the taller object
        const taller = this.tallerForm.getRawValue();
        taller.importadoras = this.listadoImportadoras;

        if (taller.id == null) {
            // Update the taller on the server
            this._gestionTalleresService.createTaller(taller).subscribe((newTaller) => {
                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', newTaller.id);
                            this.file_data = formData
                            this._gestionTalleresService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Taller registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-talleres']);
            });
        } else {
            // Update the taller on the server
            this._gestionTalleresService.updateTaller(taller.id, taller).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', taller.id);
                            this.file_data = formData
                            this._gestionTalleresService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Taller modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-talleres']);
            });
        }
    }

    adjuntarFoto(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.tallerForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.tallerForm.get('foto').setValue("");
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
                latitud: Number(this.tallerForm.get('latitud').value),
                longitud: Number(this.tallerForm.get('longitud').value)
            }
          });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Ubicacion = result[1];
                this.tallerForm.get('ubicacion').setValue(selected.lat + " / " + selected.lon);
                this.tallerForm.get('latitud').setValue(selected.lat);
                this.tallerForm.get('longitud').setValue(selected.lon);
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
                idTaller: this.taller.id,
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
     * Delete the taller
     */
    deleteTaller(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar taller',
            message: 'Está seguro de que desea eliminar este taller? Esta acción no se puede deshacer!',
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
                // Get the current taller's id
                const id = this.taller.id;

                // Get the next/previous taller's id
                const currentTallerIndex = this.talleres.findIndex(item => item.id === id);
                const nextTallerIndex = currentTallerIndex + ((currentTallerIndex === (this.talleres.length - 1)) ? -1 : 1);
                const nextTallerId = (this.talleres.length === 1 && this.talleres[0].id === id) ? null : this.talleres[nextTallerIndex].id;

                // Delete the taller
                this._gestionTalleresService.deleteTaller(id)
                    .subscribe((isDeleted) => {

                        // Return if the taller wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next taller if available
                        if (nextTallerId) {
                            this._router.navigate(['../', nextTallerId], { relativeTo: this._activatedRoute });
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
    * Open subcategorias dialog
    */
     openBuscadorImportador(): void {
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
                this.listadoImportadoras.push(selected);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }    

    deleteImportadora(index: number): void {
        this.listadoImportadoras.splice(index, 1);

        // Mark for check
        this._changeDetectorRef.markForCheck();
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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Importador } from '../importadores';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionImportadoresListComponent } from '../gestion-importadores-list/gestion-importadores-list.component';
import { GestionImportadoresService } from '../gestion-importadores.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { Marca } from '../../gestion-marcas/marcas';
import { GestionMarcasService } from '../../gestion-marcas/gestion-marcas.service';
import { BuscadorMarcasComponent } from '../../buscadores/buscador-marcas/buscador-marcas.component';
import Swal from 'sweetalert2';
import { BuscadorDistribuidoresComponent } from '../../buscadores/buscador-distribuidor/buscador-distribuidor.component';
import { Distribuidor } from '../../gestion-distribuidores/distribuidores';
import { GestionDistribuidoresService } from '../../gestion-distribuidores/gestion-distribuidores.service';

@Component({
    selector: 'gestion-importadores-detail',
    templateUrl: './gestion-importadores-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionImportadoresDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    importador: Importador;
    importadorForm: FormGroup;
    importadores: Importador[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    listadoMarcas: Marca[];
    listadoDistribuidores: Distribuidor[];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionImportadoresListComponent: GestionImportadoresListComponent,
        private _gestionImportadoresService: GestionImportadoresService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _gestionMarcasService: GestionMarcasService,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.listadoMarcas = [];
        this.listadoDistribuidores = [];

        // Open the drawer
        this._gestionImportadoresListComponent.matDrawer.open();

        // Create the importador form
        this.importadorForm = this._formBuilder.group({
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
            marcas: [''],
        });

        // Get the importador
        this._gestionImportadoresService.importadores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((importadores: Importador[]) => {
                this.importadores = importadores;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the importador
        this._gestionImportadoresService.importador$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((importador: Importador) => {

                // Open the drawer in case it is closed
                this._gestionImportadoresListComponent.matDrawer.open();

                // Get the importador
                this.importador = importador;

                if (importador != null) {
                    this.editPassword = true;

                    this._gestionImportadoresService.getFile(importador.id).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                        this._changeDetectorRef.markForCheck();
                    });

                    this._gestionMarcasService.getMarcasPorImportador(importador.id).subscribe(data => {
                        this.listadoMarcas = data;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

                    this._gestionDistribuidoresService.getDistribuidoresPorImportador(importador.id).subscribe(data => {
                        this.listadoDistribuidores = data;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.listadoMarcas = [];
                    this.listadoDistribuidores = [];
                    this.imagenBase64 = "";
                    this.editPassword = false;
                    this.importadorForm.reset();
                    importador = new Importador();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.importadorForm.patchValue(importador);

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
        return this._gestionImportadoresListComponent.matDrawer.close();
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
     * Update the importador
     */
    updateImportador(): void {
        // Get the importador object
        const importador = this.importadorForm.getRawValue();
        importador.marcas = this.listadoMarcas;
        importador.distribuidores = this.listadoDistribuidores;

        if (importador.id == null) {
            // Update the importador on the server
            this._gestionImportadoresService.createImportador(importador).subscribe((newImportador) => {
                Swal.fire({
                    title: 'Importador registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', newImportador.id);
                            this.file_data = formData
                            this._gestionImportadoresService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                // Toggle the edit mode off
                this.toggleEditMode(false);
                this._router.navigate(['gestion-importadores']);
            });
        } else {
            // Update the importador on the server
            this._gestionImportadoresService.updateImportador(importador.id, importador).subscribe(() => {
                Swal.fire({
                    title: 'Importador modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', importador.id);
                            this.file_data = formData
                            this._gestionImportadoresService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-importadores']);
            });
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
                idImportador: this.importador.id,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['admin-ifec']);
            });
    }

    adjuntarFoto(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.importadorForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.importadorForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    /**
    * Open subcategorias dialog
    */
    openBuscadorMarca(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.listadoMarcas.push(selected);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    deleteMarca(index: number): void {
        this.listadoMarcas.splice(index, 1);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
    * Open subcategorias dialog
    */
    openBuscadorDistribuidor(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorDistribuidoresComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Distribuidor = result[1];
                this.listadoDistribuidores.push(selected);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    deleteDistribuidor(index: number): void {
        this.listadoDistribuidores.splice(index, 1);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the importador
     */
    deleteImportador(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar importador',
            message: 'Está seguro de que desea eliminar este importador? Esta acción no se puede deshacer!',
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
                // Get the current importador's id
                const id = this.importador.id;

                // Get the next/previous importador's id
                const currentImportadorIndex = this.importadores.findIndex(item => item.id === id);
                const nextImportadorIndex = currentImportadorIndex + ((currentImportadorIndex === (this.importadores.length - 1)) ? -1 : 1);
                const nextImportadorId = (this.importadores.length === 1 && this.importadores[0].id === id) ? null : this.importadores[nextImportadorIndex].id;

                // Delete the importador
                this._gestionImportadoresService.deleteImportador(id)
                    .subscribe((isDeleted) => {

                        // Return if the importador wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next importador if available
                        if (nextImportadorId) {
                            this._router.navigate(['../', nextImportadorId], { relativeTo: this._activatedRoute });
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

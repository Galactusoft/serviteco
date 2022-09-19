import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Referencia } from '../referencias';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Marca } from '../../gestion-marcas/marcas';
import { BuscadorMarcasComponent } from '../../buscadores/buscador-marcas/buscador-marcas.component';
import { BuscadorCategoriasComponent } from '../../buscadores/buscador-categorias/buscador-categorias.component';
import { GestionReferenciasService } from '../gestion-referencias.service';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';
import { GestionReferenciasListComponent } from '../gestion-referencias-list/gestion-referencias-list.component';
import Swal from 'sweetalert2';
import { BuscadorImportadorasComponent } from '../../buscadores/buscador-importador/buscador-importador.component';
import { BuscadorMarcasImportadorComponent } from '../../buscadores/buscador-marcas-importador/buscador-marcas-importador.component';

@Component({
    selector: 'gestion-referencias-detail',
    templateUrl: './gestion-referencias-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionReferenciasDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    referencia: Referencia;
    referenciaForm: FormGroup;
    referencias: Referencia[];
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
        private _gestionReferenciaListComponent: GestionReferenciasListComponent,
        private _gestionReferenciasService: GestionReferenciasService,
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
        this._gestionReferenciaListComponent.matDrawer.open();

        // Create the referencia form
        this.referenciaForm = this._formBuilder.group({
            id: [''],
            nombre: [null],
            descripcion: [null],
            id_tipo_producto: [null],
            nombre_tipo_producto: [null],
            id_importador: [null],
            nombre_importador: [null],
            id_marca: [null],
            nombre_marca: [null],
            estado: [''],
            foto: [''],
        });


        // Get the referencia
        this._gestionReferenciasService.referencias$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((referencias: Referencia[]) => {
                this.referencias = referencias;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the referencias
        this._gestionReferenciasService.referencia$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((referencia: Referencia) => {

                // Open the drawer in case it is closed
                this._gestionReferenciaListComponent.matDrawer.open();

                // Get the referencias
                this.referencia = referencia;

                if (referencia != null) {
                    this._gestionReferenciasService.getFile(referencia.id).subscribe(img => {
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
                    this.referenciaForm.reset();
                    referencia = new Referencia();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.referenciaForm.patchValue(referencia);

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
        return this._gestionReferenciaListComponent.matDrawer.close();
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
     * Update the referencias
     */
    updateReferencia(): void {
        // Get the referencias object
        const referencia = this.referenciaForm.getRawValue();

        if (referencia.id == null) {
            // Update the referencias on the server
            this._gestionReferenciasService.createReferencia(referencia).subscribe((ref) => {

                this._gestionReferenciasService.getReferenciasImportadores().subscribe(() => {
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

                Swal.fire({
                    title: 'referencia registrada exitosamente!',
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
                            formData.append('id', ref.id);
                            this.file_data = formData
                            this._gestionReferenciasService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Toggle the edit mode off
                this.toggleEditMode(false);
                this._router.navigate(['gestion-referencias']);
            });
        } else {
            // Update the referencias on the server
            this._gestionReferenciasService.updateReferencia(referencia.id, referencia).subscribe(() => {

                this._gestionReferenciasService.getReferenciasImportadores().subscribe(() => {
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', referencia.id);
                            this.file_data = formData
                            this._gestionReferenciasService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'referencia modificada exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-referencias']);
            });
        }
    }

    adjuntarFoto(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.referenciaForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.referenciaForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    /**
    * Open categorias dialog
    */
    openBuscadorCategoria(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorCategoriasComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: TipoProducto = result[1];
                this.referenciaForm.get('id_tipo_producto').setValue(selected.id);
                this.referenciaForm.get('nombre_tipo_producto').setValue(selected.nombre);
            });
    }

    /**
    * Open importador dialog
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
                const selected: TipoProducto = result[1];
                this.referenciaForm.get('id_importador').setValue(selected.id);
                this.referenciaForm.get('nombre_importador').setValue(selected.nombre);
            });
    }

    /**
    * Open marcas dialog
    */
    openBuscadorMarcas(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasImportadorComponent, {
            data: {
                idImportador: this.referenciaForm.get('id_importador').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.referenciaForm.get('id_marca').setValue(selected.id);
                this.referenciaForm.get('nombre_marca').setValue(selected.nombre);
            });
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Delete the referencias
     */
    deleteReferencia(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar referencia',
            message: 'Está seguro de que desea eliminar esta referencia ? Esta acción no se puede deshacer!',
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
                // Get the current referencias's id
                const id = this.referencia.id;

                // Delete the referencias
                this._gestionReferenciasService.deleteReferencia(id)
                    .subscribe((request) => {

                        // Return if the referencia wasn't deleted...
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

                        this._gestionReferenciaListComponent.consultarData();

                        // Otherwise, navigate to the parent
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

                        // Mark for check
                        this._changeDetectorRef.markForCheck();

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Marca } from '../marcas';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionMarcasListComponent } from '../gestion-marcas-list/gestion-marcas-list.component';
import { GestionMarcasService } from '../gestion-marcas.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-marcas-detail',
    templateUrl: './gestion-marcas-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionMarcasDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    marca: Marca;
    marcaForm: FormGroup;
    marcas: Marca[];
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
        private _gestionMarcasListComponent: GestionMarcasListComponent,
        private _gestionMarcasService: GestionMarcasService,
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
        this._gestionMarcasListComponent.matDrawer.open();

        // Create the marca form
        this.marcaForm = this._formBuilder.group({
            id: [''],
            nombre: [null],
            descripcion: [null],
            foto: [null],
            imagen: [null],
            estado: [''],
            fecha_sistema: [''],
        });

        // Get the marca
        this._gestionMarcasService.marcas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((marcas: Marca[]) => {
                this.marcas = marcas;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the marca
        this._gestionMarcasService.marca$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((marca: Marca) => {

                // Open the drawer in case it is closed
                this._gestionMarcasListComponent.matDrawer.open();

                // Get the marca
                this.marca = marca;

                if (marca != null) {
                    this.editPassword = true;

                    this._gestionMarcasService.getFile(marca.id).subscribe(img => {
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
                    this.marcaForm.reset();
                    marca = new Marca();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.marcaForm.patchValue(marca);

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
        return this._gestionMarcasListComponent.matDrawer.close();
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
     * Update the marca
     */
    updateMarca(): void {
        // Get the marca object
        const marca = this.marcaForm.getRawValue();

        if (marca.id == null) {
            // Update the marca on the server
            this._gestionMarcasService.createMarca(marca).subscribe((newMarca) => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', newMarca.id);
                            this.file_data = formData
                            this._gestionMarcasService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Marca registrada exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-marcas']);
            });
        } else {
            // Update the marca on the server
            this._gestionMarcasService.updateMarca(marca.id, marca).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', marca.id);
                            this.file_data = formData
                            this._gestionMarcasService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Marca modificada exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-marcas']);
            });
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.marcaForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.marcaForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Delete the marca
     */
    deleteMarca(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar marca',
            message: 'Está seguro de que desea eliminar este marca? Esta acción no se puede deshacer!',
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
                // Get the current marca's id
                const id = this.marca.id;

                // Get the next/previous marca's id
                const currentMarcaIndex = this.marcas.findIndex(item => item.id === id);
                const nextMarcaIndex = currentMarcaIndex + ((currentMarcaIndex === (this.marcas.length - 1)) ? -1 : 1);
                const nextMarcaId = (this.marcas.length === 1 && this.marcas[0].id === id) ? null : this.marcas[nextMarcaIndex].id;

                // Delete the marca
                this._gestionMarcasService.deleteMarca(id)
                    .subscribe((isDeleted) => {

                        // Return if the marca wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next marca if available
                        if (nextMarcaId) {
                            this._router.navigate(['../', nextMarcaId], { relativeTo: this._activatedRoute });
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

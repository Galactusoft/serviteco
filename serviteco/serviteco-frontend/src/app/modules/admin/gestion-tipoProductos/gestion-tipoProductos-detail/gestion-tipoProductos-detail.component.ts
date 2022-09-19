import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TipoProducto } from '../tipoProductos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestiontipoProductosListComponent } from '../gestion-tipoProductos-list/gestion-tipoProductos-list.component';
import { GestionTipoProductosService } from '../gestion-tipoProductos.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-tipoProductos-detail',
    templateUrl: './gestion-tipoProductos-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionTipoProductoDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    tipoProducto: TipoProducto;
    tipoProductoForm: FormGroup;
    tipoProductos: TipoProducto[];
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
        private  _gestionTipoProductoListComponent: GestiontipoProductosListComponent,
        private _gestionTipoProductosService: GestionTipoProductosService,
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
        this._gestionTipoProductoListComponent.matDrawer.open();

        // Create the Producto form
        this.tipoProductoForm = this._formBuilder.group({
            id: [''],
            nombre: [null],
            descripcion: [null],
            estado: ['']
//estado: [''],
    //        fecha_sistema: [''],
        });

     
        // Get the Tipo producto
        this._gestionTipoProductosService.tipoProductos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tipoProductos: TipoProducto[]) => {
                this.tipoProductos = tipoProductos;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
                            
        // Get the tipoProductos
        this._gestionTipoProductosService.tipoProducto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tipoProducto: TipoProducto) => {

                // Open the drawer in case it is closed
                this._gestionTipoProductoListComponent.matDrawer.open();

                // Get the tipoProductos
                this.tipoProducto = tipoProducto;

                if (tipoProducto != null) {
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.editPassword = false;
                    this.tipoProductoForm.reset();
                    tipoProducto = new TipoProducto();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.tipoProductoForm.patchValue(tipoProducto);

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
        return this._gestionTipoProductoListComponent.matDrawer.close();
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
     * Update the tipoProductos
     */
    updateTipoProducto(): void {
        // Get the tipoProductos object
        const tipoProducto = this.tipoProductoForm.getRawValue();

        if (tipoProducto.id == null) {
            // Update the tipoProductos on the server
            this._gestionTipoProductosService.createTipoProducto(tipoProducto).subscribe(() => {

                Swal.fire({
                    title: 'Categoría registrada exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-categorias']);
            });
        } else {
            // Update the tipoProductos on the server
            this._gestionTipoProductosService.updateTipoProducto(tipoProducto.id, tipoProducto).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', tipoProducto.id);
                            this.file_data = formData
                            this._gestionTipoProductosService.loadFile(this.file_data).subscribe(res => {
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
                    title: 'Categoría modificada exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-categorias']);
            });
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.tipoProductoForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.tipoProductoForm.get('foto').setValue("");
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
                idTipoProducto: this.tipoProducto.id,
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
     * Delete the tipoProductos
     */
    deleteTipoProducto(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar Categoría',
            message: 'Está seguro de que desea eliminar esta categoría? Esta acción no se puede deshacer!',
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
                // Get the current tipoProductos's id
                const id = this.tipoProducto.id;

                // Get the next/previous tipoProductos's id
                const currentTipoProductoIndex = this.tipoProductos.findIndex(item => item.id === id);
                const nextTipoProductoIndex = currentTipoProductoIndex + ((currentTipoProductoIndex === (this.tipoProductos.length - 1)) ? -1 : 1);
                const nextTipoProductoId = (this.tipoProductos.length === 1 && this.tipoProductos[0].id === id) ? null : this.tipoProducto[nextTipoProductoIndex].id;

                // Delete the tipoProductos
                this._gestionTipoProductosService.deleteTipoProducto(id)
                    .subscribe((isDeleted) => {

                        // Return if the tipoProductos wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next tipoProductos if available
                        if (nextTipoProductoId) {
                            this._router.navigate(['../', nextTipoProductoId], { relativeTo: this._activatedRoute });
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

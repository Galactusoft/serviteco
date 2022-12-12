import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Repuesto } from '../repuestos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionrepuestosListComponent } from '../gestion-repuestos-list/gestion-repuestos-list.component';
import { GestionRepuestosService } from '../gestion-repuestos.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { Marca } from '../../gestion-marcas/marcas';
import { BuscadorMarcasComponent } from '../../buscadores/buscador-marcas/buscador-marcas.component';
import { BuscadorCategoriasComponent } from '../../buscadores/buscador-categorias/buscador-categorias.component';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';
import Swal from 'sweetalert2';
import { BuscadorReferenciasComponent } from '../../buscadores/buscador-referencias/buscador-referencias.component';

@Component({
    selector: 'gestion-repuestos-detail',
    templateUrl: './gestion-repuestos-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionRepuestoDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    repuesto: Repuesto;
    repuestoForm: FormGroup;
    repuestos: Repuesto[];
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
        private _gestionRepuestoListComponent: GestionrepuestosListComponent,
        private _gestionRepuestosService: GestionRepuestosService,
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
        this._gestionRepuestoListComponent.matDrawer.open();

        // Create the Repuesto form
        this.repuestoForm = this._formBuilder.group({
            id: [''],
            material: [null],
            pieza_fabricante: [null],
            nombre: [null],
            descripcion: [null],
            estado: [''],
            id_marca: [null],
            nombre_marca: [null],
            id_categoria: [null],
            nombre_categoria: [null],
            id_referencia: [null],
            nombre_referencia: [null],
            //estado: [''],
            //        fecha_sistema: [''],
        });


        // Get the Repuestos
        this._gestionRepuestosService.repuestos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repuestos: Repuesto[]) => {
                this.repuestos = repuestos;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the repuestos
        this._gestionRepuestosService.repuesto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((repuesto: Repuesto) => {

                // Open the drawer in case it is closed
                this._gestionRepuestoListComponent.matDrawer.open();

                // Get the repuestos
                this.repuesto = repuesto;

                if (repuesto != null) {
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.editPassword = false;
                    this.repuestoForm.reset();
                    repuesto = new Repuesto();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.repuestoForm.patchValue(repuesto);

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
        return this._gestionRepuestoListComponent.matDrawer.close();
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
     * Update the repuestos
     */
    updateRepuesto(): void {
        // Get the repuestos object
        const repuesto = this.repuestoForm.getRawValue();

        if (repuesto.id == null) {
            // Update the repuestos on the server
            this._gestionRepuestosService.createRepuesto(repuesto).subscribe(() => {

                Swal.fire({
                    title: 'Repuesto registrado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                this._gestionRepuestosService.getRepuestosMarcas().subscribe(() => {
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-repuestos']);
            });
        } else {
            // Update the repuestos on the server
            this._gestionRepuestosService.updateRepuesto(repuesto.id, repuesto).subscribe(() => {

                Swal.fire({
                    title: 'Repuesto modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })

                this._gestionRepuestosService.getRepuestosMarcas().subscribe(() => {
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });


                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-repuestos']);
            });
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.repuestoForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.repuestoForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    /**
    * Open marcas dialog
    */
    openBuscadorMarcas(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.repuestoForm.get('id_marca').setValue(selected.id);
                this.repuestoForm.get('nombre_marca').setValue(selected.nombre);
            });
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
                this.repuestoForm.get('id_categoria').setValue(selected.id);
                this.repuestoForm.get('nombre_categoria').setValue(selected.nombre);
            });
    }

    /**
    * Open referencias dialog
    */
    openBuscadorReferencias(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorReferenciasComponent, {
            data: {
                idTipoProducto: this.repuestoForm.get('id_categoria').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.repuestoForm.get('id_referencia').setValue(selected.id);
                this.repuestoForm.get('nombre_referencia').setValue(selected.nombre);
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
                idRepuesto: this.repuesto.id,
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
     * Delete the repuestos
     */
    deleteRepuesto(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar Repuesto',
            message: 'Está seguro de que desea eliminar este repuesto ? Esta acción no se puede deshacer!',
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
                // Get the current repuestos's id
                const id = this.repuesto.id;

                // Delete the repuestos
                this._gestionRepuestosService.deleteRepuesto(id)
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

                        this._gestionRepuestoListComponent.consultarData();

                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

                        // Mark for check
                        this._changeDetectorRef.markForCheck();

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

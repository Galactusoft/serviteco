import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ManoObra } from '../mano-obra';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionManoObrasListComponent } from '../gestion-mano-obra-list/gestion-mano-obra-list.component';
import { GestionManoObrasService } from '../gestion-mano-obra.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
    selector: 'gestion-mano-obra-detail',
    templateUrl: './gestion-mano-obra-detail.component.html',                
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionManoObrasDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    manoObra: ManoObra;
    manoObraForm: FormGroup;
    manoObras: ManoObra[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionManoObraListComponent: GestionManoObrasListComponent,
        private _gestionManoObraService: GestionManoObrasService,
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
        this._gestionManoObraListComponent.matDrawer.open();

        // Create the manoObra form
        this.manoObraForm = this._formBuilder.group({
            id: [''],
            nombre: [null],
            descripcion: [null],
            valor_unitario: [null],
            horas: [null],
            estado: [''],
            fecha_sistema: [''],
        });

        // Get the manoObra
        this._gestionManoObraService.manoObras$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manoObras: ManoObra[]) => {
                this.manoObras = manoObras;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the manoObra
        this._gestionManoObraService.manoObra$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manoObra: ManoObra) => {

                // Open the drawer in case it is closed
                this._gestionManoObraListComponent.matDrawer.open();

                // Get the manoObra
                this.manoObra = manoObra;

                if (manoObra != null) {
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.manoObraForm.reset();
                    manoObra = new ManoObra();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.manoObraForm.patchValue(manoObra);

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
        return this._gestionManoObraListComponent.matDrawer.close();
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
     * Update the manoObra
     */
    updateManoObra(): void {
        // Get the manoObra object
        const manoObra = this.manoObraForm.getRawValue();

        if (manoObra.id == null) {
            // Update the manoObra on the server
            this._gestionManoObraService.createManoObra(manoObra).subscribe(() => {

                Swal.fire({
                    title: 'Mano de obra registrada exitosamente',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-mano-obra']);
            });
        } else {
            // Update the manoObra on the server
            this._gestionManoObraService.updateManoObra(manoObra.id, manoObra).subscribe(() => {

                Swal.fire({
                    title: 'Mano de obra modificada exitosamente',
                    icon: 'info',
                    timer: 1000
                })

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-mano-obra']);
            });
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Delete the manoObra
     */
    deleteManoObra(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar manoObra',
            message: 'Está seguro de que desea eliminar este manoObra? Esta acción no se puede deshacer!',
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
                // Get the current manoObra's id
                const id = this.manoObra.id;

                // Get the next/previous manoObra's id
                const currentManoObraIndex = this.manoObras.findIndex(item => item.id === id);
                const nextManoObraIndex = currentManoObraIndex + ((currentManoObraIndex === (this.manoObras.length - 1)) ? -1 : 1);
                const nextManoObraId = (this.manoObras.length === 1 && this.manoObras[0].id === id) ? null : this.manoObras[nextManoObraIndex].id;

                // Delete the manoObra
                this._gestionManoObraService.deleteManoObra(id)
                    .subscribe((isDeleted) => {

                        // Return if the manoObra wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next manoObra if available
                        if (nextManoObraId) {
                            this._router.navigate(['../', nextManoObraId], { relativeTo: this._activatedRoute });
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

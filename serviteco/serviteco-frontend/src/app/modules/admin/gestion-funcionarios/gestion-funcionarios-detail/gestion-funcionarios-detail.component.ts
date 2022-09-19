import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionFuncionariosListComponent } from '../gestion-funcionarios-list/gestion-funcionarios-list.component';
import { MatDialog } from '@angular/material/dialog';
import { Funcionario } from '../funcionarios';
import { GestionFuncionariosService } from '../gestion-funcionarios.service';

@Component({
    selector: 'gestion-funcionarios-detail',
    templateUrl: './gestion-funcionarios-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionFuncionarioDetailComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    funcionario: Funcionario;
    funcionarioForm: FormGroup;
    funcionarios: Funcionario[];
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
        private  _gestionFuncionarioListComponent: GestionFuncionariosListComponent,
        private _gestionFuncionariosService: GestionFuncionariosService,
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
        this._gestionFuncionarioListComponent.matDrawer.open();

        // Create the funcionario form
        this.funcionarioForm = this._formBuilder.group({
            id: [''],
            nombre_completo: [null],
            identificacion: [null],
            correo: [null],
            telefono: [null],
            cargo: [null],
            estado: ['']
//estado: [''],
    //        fecha_sistema: [''],
        });

     
        // Get the funcionario
        this._gestionFuncionariosService.funcionarios$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((funcionarios: Funcionario[]) => {
                this.funcionarios = funcionarios;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
                            
        // Get the funcionario
        this._gestionFuncionariosService.funcionario$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((funcionario: Funcionario) => {

                // Open the drawer in case it is closed
                this._gestionFuncionarioListComponent.matDrawer.open();

                // Get the funcionario
                this.funcionario = funcionario;

                if (funcionario != null) {
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.funcionarioForm.reset();
                    funcionario = new Funcionario();
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.funcionarioForm.patchValue(funcionario);

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
        return this._gestionFuncionarioListComponent.matDrawer.close();
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
     * Update the funcionario
     */
    updateFuncionario(): void {
        // Get the funcionario object
        const funcionario = this.funcionarioForm.getRawValue();

        if (funcionario.id == null) {
            // Update the funcionario on the server
            this._gestionFuncionariosService.createFuncionario(funcionario).subscribe(() => {

                this.openSnackBar("Funcionario registrado exitosamente", "Cerrar");

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-funcionarios']);
            });
        } else {
            // Update the funcionario on the server
            this._gestionFuncionariosService.updateFuncionario(funcionario.id, funcionario).subscribe(() => {

                if (this.cargaNuevaFoto) {
                    if (null != this.selectedFiles && this.selectedFiles.length > 0) {
                        const file = this.selectedFiles[0];
                        //max file size is 4 mb
                        if ((file.size / 1048576) <= 4) {
                            let formData = new FormData();
                            let info = { id: 2, name: 'raja' }
                            formData.append('file', file, file.name);
                            formData.append('id', funcionario.id);
                            this.file_data = formData
                            this._gestionFuncionariosService.loadFile(this.file_data).subscribe(res => {
                                console.log(res)
                            }, (err) => {
                                console.log(err)
                            });
                        } else {
                            this._snackBar.open("El tamaño del archivo supera los 4 MB", "Cerrar");
                        }
                    }
                }

                this.openSnackBar("Funcionario modificado exitosamente", "Cerrar");

                // Toggle the edit mode off
                this.toggleEditMode(false);

                this._router.navigate(['gestion-funcionarios']);
            });
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.funcionarioForm.get('foto').setValue(e.target.files[0].name);
        } else {
            this.openSnackBar('Solo es permitido adjuntar archivos con formato png o jpg', 'Cerrar');
            this.funcionarioForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Delete the funcionario
     */
    deleteFuncionario(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar funcionario',
            message: 'Está seguro de que desea eliminar este funcionario ? Esta acción no se puede deshacer!',
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
                // Get the current funcionario's id
                const id = this.funcionario.id;

                // Get the next/previous funcionario's id
                const currentFuncionarioIndex = this.funcionarios.findIndex(item => item.id === id);
                const nextFuncionarioIndex = currentFuncionarioIndex + ((currentFuncionarioIndex === (this.funcionarios.length - 1)) ? -1 : 1);
                const nextFuncionarioId = (this.funcionarios.length === 1 && this.funcionarios[0].id === id) ? null : this.funcionario[nextFuncionarioIndex].id;

                // Delete the funcionario
                this._gestionFuncionariosService.deleteFuncionario(id)
                    .subscribe((isDeleted) => {

                        // Return if the funcionario wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next funcionario if available
                        if (nextFuncionarioId) {
                            this._router.navigate(['../', nextFuncionarioId], { relativeTo: this._activatedRoute });
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

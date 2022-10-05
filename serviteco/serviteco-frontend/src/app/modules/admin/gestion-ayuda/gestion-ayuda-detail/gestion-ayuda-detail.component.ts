import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, takeUntil, Observable } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UsuarioFinal } from '../../gestion-usuario-final/usuario-final';
import { Ayuda } from '../ayuda';
import { GestionAyudaService } from '../gestion-ayuda.service';
import { GestionUsuarioFinalService } from '../../gestion-usuario-final/gestion-usuario-final.service';
import { Evidencias } from '../../gestion-solicitudes/recepcion-solicitud';
import { AuthService } from 'app/core/auth/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'gestion-ayuda-detail',
    templateUrl: './gestion-ayuda-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionAyudaDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    ayuda: Ayuda;
    ayudaForm: FormGroup;
    ayudas: Ayuda[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    serial: String
    textoGarantia: string;
    usuarioRegistro: boolean = false;
    titulo: string = "Gestión de ticket mesa de ayuda"
    imagenes: Evidencias[];
    url: any;
    cargoNuevaEvidencia: boolean = false;
    usuarioFinal: boolean = true;

    listadoUsuario: UsuarioFinal[];
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionAyudaService: GestionAyudaService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
        private _aut: AuthService,
        private sanitization: DomSanitizer
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (this._aut.accessAdmin != '') {
            this.usuarioFinal = false;
        }
        if (this._router.url.includes('registro-ayuda')) {
            this.usuarioRegistro = true;
            this.titulo = "Registro de ayuda";
        } else {
            this.usuarioRegistro = false;
        }
        this.imagenes = [];
        this.listadoUsuario = [];
        // Create the ayuda form
        this.ayudaForm = this._formBuilder.group({
            id: [''],
            id_usuario: [null],
            nombre_usuario: [null],
            estado_actual: [null],
            descripcion: [null],
            respuesta: [null],
            estado: [null],
        });

        // Get the ayuda
        this._gestionAyudaService.ayudas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ayudas: Ayuda[]) => {
                this.ayudas = ayudas;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the ayudas
        this._gestionAyudaService.ayuda$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ayuda: Ayuda) => {

                // Get the ayudas
                this.ayuda = ayuda;

                if (ayuda.id != null) {

                    this._gestionAyudaService.getFile(ayuda.id).subscribe(imgs => {
                        this.imagenes = [];
                        imgs.forEach(img => {
                            let objectURL = 'data:image/png;base64,' + img.imagen;
                            img.imagen = this.sanitization.bypassSecurityTrustUrl(objectURL);
                            this.imagenes.push(img);
                        })
                        this._changeDetectorRef.markForCheck();
                    });

                    // Toggle the edit mode off
                    this.toggleEditMode(true);

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    this.ayudaForm.reset();
                    ayuda = new Ayuda();
                    this.toggleEditMode(false);
                    if (this._aut.accessAdmin == 'administrador') {
                        this.ayudaForm.get('id_usuario').setValue("1");
                        this.ayudaForm.get('nombre_usuario').setValue("SERVITECO");
                    } else if (this._aut.accessAdmin == 'distribuidor') {
                        this.ayudaForm.get('id_usuario').setValue(this._aut.accessDistribuidor);
                        this.ayudaForm.get('nombre_usuario').setValue(this._aut.accessCompany);
                    } else if (this._aut.accessAdmin == 'importador') {
                        this.ayudaForm.get('id_usuario').setValue(this._aut.accessImportador);
                        this.ayudaForm.get('nombre_usuario').setValue(this._aut.accessCompany);
                    } else if (this._aut.accessAdmin == 'taller autorizado') {
                        this.ayudaForm.get('id_usuario').setValue(this._aut.accessTaller);
                        this.ayudaForm.get('nombre_usuario').setValue(this._aut.accessCompany);
                    } else if (this._aut.accessAdmin == 'funcionario') {
                        this.ayudaForm.get('id_usuario').setValue(this._aut.accessTaller);
                        this.ayudaForm.get('nombre_usuario').setValue(this._aut.accessCompany);
                    }
                    this.ayudaForm.get('estado_actual').setValue("Creado");
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }

                // Patch values to the form
                this.ayudaForm.patchValue(ayuda);

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
     * Update the ayudas
     */
    updateayuda(): void {
        // Get the ayudas object
        const ayuda = this.ayudaForm.getRawValue();
        if (ayuda.id == null) {
            // Update the ayudas on the server
            this._gestionAyudaService.createAyuda(ayuda).subscribe(data => {
                if (data.id == '0') {
                    Swal.fire({
                        title: 'Ocurrió un error al guardar registro',
                        icon: 'error',
                        timer: 1000
                    })
                } else {
                    this.ayuda = data;
                    this.ayudaForm.get('id').setValue(data.id);
                    this.toggleEditMode(true);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    Swal.fire({
                        title: 'información registrada exitosamente',
                        icon: 'info',
                        timer: 1000
                    })
                }
            });
        } else {
            // Update the ayudas on the server
            this._gestionAyudaService.updateAyuda(ayuda.id, ayuda).subscribe((data) => {
                this.toggleEditMode(true);
                // Mark for check
                this._changeDetectorRef.markForCheck();
                Swal.fire({
                    title: 'registro modificado exitosamente',
                    icon: 'info',
                    timer: 1000
                })
            });
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.ayudaForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.ayudaForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    adjuntarEvidencia(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargoNuevaEvidencia = true;
            this.selectedFiles = e.target.files;
            const file = this.selectedFiles[0];
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = (_event) => {
                this.url = reader.result;
                const evidencia = new Evidencias();
                evidencia.imagen = reader.result;
                evidencia.name = e.target.files[0].name;
                evidencia.file = file;
                let formData = new FormData();
                let info = { id: 2, name: 'raja' }
                formData.append('file', file, file.name);
                formData.append('id', this.ayuda.id);
                this.file_data = formData
                this._gestionAyudaService.loadFile(this.file_data).subscribe(res => {
                    evidencia.id = res.mensaje;
                    this.imagenes.push(evidencia);
                    Swal.fire({
                        title: 'Evidencia cargada exitosamente',
                        icon: 'info',
                        timer: 1000
                    })
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }, (err) => {
                    console.log(err)
                });
            }
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.selectedFiles = undefined;
        }
    }

    deleteEvidencia(index: number, id: number): void {
        this._gestionAyudaService.deleteFile(id).subscribe(res => {
            this.imagenes.splice(index, 1);
            // Mark for check
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Evidencia eliminada exitosamente',
                icon: 'info',
                timer: 1000
            })
        }, (err) => {
            console.log(err)
        });
    }

    mostrarEvidencia(index: number): void {
        this.imagenes[index];

        const confirmation = this._fuseConfirmationService.open({
            title: 'Visor de documentos',
            icon: {
                show: false
            },
            imagen: this.imagenes[index].imagen,
            actions: {
                confirm: {
                    show: false
                },
                cancel: {
                    label: 'Cerrar'
                }
            },
            class: 'fuse-confirmation-dialog-panel-img',
        });

    }

    showModal() {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: '<a href="">Why do I have this issue?</a>'
        })
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    /**
     * Delete the ayudas
     */
    deleteAyuda(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar ayuda',
            message: 'Está seguro de que desea eliminar este registro ? Esta acción no se puede deshacer!',
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
                // Get the current ayudas's id
                const id = this.ayuda.id;

                // Get the next/previous ayudas's id
                const currentayudaIndex = this.ayudas.findIndex(item => item.id === id);
                const nextayudaIndex = currentayudaIndex + ((currentayudaIndex === (this.ayudas.length - 1)) ? -1 : 1);
                const nextayudaId = (this.ayudas.length === 1 && this.ayudas[0].id === id) ? null : this.ayuda[nextayudaIndex].id;

                // Delete the ayudas
                this._gestionAyudaService.deleteAyuda(id)
                    .subscribe((isDeleted) => {

                        // Return if the ayudas wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next ayudas if available
                        if (nextayudaId) {
                            this._router.navigate(['../', nextayudaId], { relativeTo: this._activatedRoute });
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

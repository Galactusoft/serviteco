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
import { Contactenos } from '../contactenos';
import { GestionContactenosService } from '../gestion-contactenos.service';
import { GestionUsuarioFinalService } from '../../gestion-usuario-final/gestion-usuario-final.service';
import { Evidencias } from '../../gestion-solicitudes/recepcion-solicitud';
import { TipoIdentificacion } from '../../gestion-pqrs/tipo-identificacion';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'gestion-contactenos-detail',
    templateUrl: './gestion-contactenos-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionContactenosDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    contactenos: Contactenos;
    contactenosForm: FormGroup;
    contactenoss: Contactenos[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    serial: String
    textoGarantia: string;
    listaTiposIdentificacion$: Observable<TipoIdentificacion[]>;
    usuarioRegistro: boolean = false;
    titulo: string = "Gestión de Contáctenos"
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
        private _gestionContactenosService: GestionContactenosService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService, 
        private _aut: AuthService
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
        if (this._router.url.includes('registro-contactenos')) {
            this.usuarioRegistro = true;
            this.titulo = "Registro de contáctenos";
        } else {
            this.usuarioRegistro = false;
        }
        this.imagenes = [];
        this.listadoUsuario = [];
        // Create the contactenos form
        this.contactenosForm = this._formBuilder.group({
            id: [''],
            id_tipo_identificacion: [null],
            tipo_identificacion: [null],
            identificacion: [null],
            nombres: [null],
            apellidos: [null],
            correo: [null],
            telefono: [null],
            mensaje: [null],
            respuesta: [null],
            estado: [null],
        });
        this.listaTiposIdentificacion$ = this._gestionContactenosService.tiposIdentificacion$;

        // Get the contactenos
        this._gestionContactenosService.contactenoss$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contactenoss: Contactenos[]) => {
                this.contactenoss = contactenoss;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contactenoss
        this._gestionContactenosService.contactenos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contactenos: Contactenos) => {

                // Get the contactenoss
                this.contactenos = contactenos;

                if (contactenos != null) {

                    this._gestionContactenosService.getFile(contactenos.id).subscribe(imgs => {
                        imgs.forEach(img => {
                            img.imagen = "data:image/png;base64," + img.imagen;
                            this.imagenes.push(img);
                        })
                        this._changeDetectorRef.markForCheck();
                    });

                    // Toggle the edit mode off
                    this.toggleEditMode(true);

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    this.contactenosForm.reset();
                    contactenos = new Contactenos();
                    this.toggleEditMode(false);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }

                // Patch values to the form
                this.contactenosForm.patchValue(contactenos);

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
     * Update the contactenoss
     */
    updateContactenos(): void {
        // Get the contactenoss object
        const contactenos = this.contactenosForm.getRawValue();
        contactenos.id = this.contactenos?.id;

        if (contactenos.id == null) {
            // Update the contactenoss on the server
            this._gestionContactenosService.createContactenos(contactenos).subscribe(data => {
                if (data.id == '0') {
                    Swal.fire({
                        title: 'Ocurrió un error al guardar mensaje',
                        icon: 'error',
                        timer: 1000
                    })
                } else {
                    this.contactenos = data;
                    this.toggleEditMode(true);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    Swal.fire({
                        title: 'mensaje registrado exitosamente',
                        icon: 'info',
                        timer: 1000
                    })
                }
            });
        } else {
            // Update the contactenoss on the server
            this._gestionContactenosService.updateContactenos(contactenos.id, contactenos).subscribe((data) => {
                this.contactenos = data;
                this.toggleEditMode(true);
                // Mark for check
                this._changeDetectorRef.markForCheck();
                Swal.fire({
                    title: 'mensaje modificado exitosamente',
                    icon: 'info',
                    timer: 1000
                })
            });
        }
    }

    consultarUsuarioFinal(identificacion: string): void {
        this._gestionUsuarioFinalService.getUsuarioFinalByIdentificacion(identificacion).subscribe(res => {
            if (null != res) {
                Swal.fire({
                    title: 'Usuario encontrado exitosamente',
                    icon: 'info',
                    timer: 1000
                })
                this.contactenosForm.get('nombres').setValue(res.nombres);
                this.contactenosForm.get('apellidos').setValue(res.apellidos);
                this.contactenosForm.get('identificacion').setValue(res.identificacion);
                this.contactenosForm.get('telefono').setValue(res.telefono);
                this.contactenosForm.get('correo').setValue(res.correo);
            } else {
                this.contactenosForm.get('id').setValue(null);
                this.contactenosForm.get('nombres').setValue(null);
                this.contactenosForm.get('apellidos').setValue(null);
                this.contactenosForm.get('telefono').setValue(null);
                this.contactenosForm.get('correo').setValue(null);
            }
        })
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.contactenosForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.contactenosForm.get('foto').setValue("");
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
                formData.append('id', this.contactenos.id);
                this.file_data = formData
                this._gestionContactenosService.loadFile(this.file_data).subscribe(res => {
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
        this._gestionContactenosService.deleteFile(id).subscribe(res => {
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
     * Delete the contactenoss
     */
    deleteContactenos(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar contactenos',
            message: 'Está seguro de que desea eliminar este mensaje ? Esta acción no se puede deshacer!',
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
                // Get the current contactenoss's id
                const id = this.contactenos.id;

                // Get the next/previous contactenoss's id
                const currentcontactenosIndex = this.contactenoss.findIndex(item => item.id === id);
                const nextcontactenosIndex = currentcontactenosIndex + ((currentcontactenosIndex === (this.contactenoss.length - 1)) ? -1 : 1);
                const nextcontactenosId = (this.contactenoss.length === 1 && this.contactenoss[0].id === id) ? null : this.contactenos[nextcontactenosIndex].id;

                // Delete the contactenoss
                this._gestionContactenosService.deleteContactenos(id)
                    .subscribe((isDeleted) => {

                        // Return if the contactenoss wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next contactenoss if available
                        if (nextcontactenosId) {
                            this._router.navigate(['../', nextcontactenosId], { relativeTo: this._activatedRoute });
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

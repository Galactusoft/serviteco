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
import { Pqrs } from '../pqrs';
import { GestionPqrsService } from '../gestion-pqrs.service';
import { TipoIdentificacion } from '../tipo-identificacion';
import { TipoSolicitud } from '../tipo-solicitud';
import { GestionUsuarioFinalService } from '../../gestion-usuario-final/gestion-usuario-final.service';
import { Evidencias } from '../../gestion-solicitudes/recepcion-solicitud';

@Component({
    selector: 'gestion-pqrs-detail',
    templateUrl: './gestion-pqrs-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionPqrsDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    pqrs: Pqrs;
    pqrsForm: FormGroup;
    pqrss: Pqrs[];
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
    listaTiposSolicitud$: Observable<TipoSolicitud[]>;
    usuarioRegistro: boolean = false;
    titulo: string = "Gestión de PQRS"
    imagenes: Evidencias[];
    url: any;
    cargoNuevaEvidencia: boolean = false;
    consultoSerial: boolean = false;
    listadoUsuario: UsuarioFinal[];
    listaSeriales$: Observable<String[]>;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionPqrsService: GestionPqrsService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (this._router.url.includes('registro-pqrs')) {
            this.usuarioRegistro = true;
            this.titulo = "Registro de PRQS";
        } else {
            this.usuarioRegistro = false;
        }
        this.imagenes = [];
        this.listadoUsuario = [];
        // Create the pqrs form
        this.pqrsForm = this._formBuilder.group({
            id: [''],
            uuid: [null],
            id_tipo_solicitud: [null],
            tipo_solicitud: [null],
            id_tipo_identificacion: [null],
            tipo_identificacion: [null],
            identificacion: [null],
            nombres: [null],
            apellidos: [null],
            correo: [null],
            telefono: [null],
            mensaje: [null],
            serial: [null],
        });
        this.listaTiposIdentificacion$ = this._gestionPqrsService.tiposIdentificacion$;
        this.listaTiposSolicitud$ = this._gestionPqrsService.tiposSolicitud$;
        this.listaSeriales$ = this._gestionPqrsService.seriales$;

        // Get the pqrs
        this._gestionPqrsService.pqrss$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pqrss: Pqrs[]) => {
                this.pqrss = pqrss;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pqrss
        this._gestionPqrsService.pqrs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pqrs: Pqrs) => {

                // Get the pqrss
                this.pqrs = pqrs;

                if (pqrs != null) {

                    this._gestionPqrsService.getFile(pqrs.id).subscribe(imgs => {
                        imgs.forEach(img => {
                            img.imagen = "data:image/png;base64," + img.imagen;
                            this.imagenes.push(img);
                        })
                        this._changeDetectorRef.markForCheck();
                    });

                    if (pqrs.id_tipo_solicitud == '3') {
                        this.consultoSerial = true;
                        this._gestionPqrsService.getSeriales(pqrs.identificacion).subscribe(data => {
                            console.log(data)
                        });
                    } else {
                        this.consultoSerial = false;
                    }

                    // Toggle the edit mode off
                    this.toggleEditMode(true);

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    this.pqrsForm.reset();
                    pqrs = new Pqrs();
                    this.toggleEditMode(false);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }

                // Patch values to the form
                this.pqrsForm.patchValue(pqrs);

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
     * Update the pqrss
     */
    updatePqrs(): void {
        // Get the pqrss object
        const pqrs = this.pqrsForm.getRawValue();
        pqrs.id = this.pqrs?.id;

        if (pqrs.id == null) {
            // Update the pqrss on the server
            this._gestionPqrsService.createPqrs(pqrs).subscribe(data => {
                if (data.id == '0') {
                    Swal.fire({
                        title: 'Ocurrió un error al guardar pqrs',
                        icon: 'error',
                        timer: 1000
                    })
                } else {
                    this.pqrs = data;
                    this.pqrsForm.get('uuid').setValue(data.uuid);
                    this.toggleEditMode(true);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    Swal.fire({
                        title: 'pqrs registrado exitosamente!',
                        icon: 'info',
                        timer: 1000
                    })
                }
            });
        } else {
            // Update the pqrss on the server
            this._gestionPqrsService.updatePqrs(pqrs.id, pqrs).subscribe((data) => {
                this.pqrs = data;
                this.toggleEditMode(true);
                // Mark for check
                this._changeDetectorRef.markForCheck();
                Swal.fire({
                    title: 'pqrs modificado exitosamente!',
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
                    title: 'Usuario modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                this.pqrsForm.get('nombres').setValue(res.nombres);
                this.pqrsForm.get('apellidos').setValue(res.apellidos);
                this.pqrsForm.get('identificacion').setValue(res.identificacion);
                this.pqrsForm.get('telefono').setValue(res.telefono);
                this.pqrsForm.get('correo').setValue(res.correo);
                if (this.pqrsForm.get('id_tipo_solicitud').value == 3) {
                    this.consultoSerial = true;
                    this._gestionPqrsService.getSeriales(res.identificacion).subscribe(data => {
                        console.log(data)
                    });
                } else {
                    this.consultoSerial = false;
                }
            } else {
                this.pqrsForm.get('id').setValue(null);
                this.pqrsForm.get('nombres').setValue(null);
                this.pqrsForm.get('apellidos').setValue(null);
                this.pqrsForm.get('telefono').setValue(null);
                this.pqrsForm.get('correo').setValue(null);
            }
        })
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.pqrsForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.pqrsForm.get('foto').setValue("");
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
                formData.append('id', this.pqrs.id);
                this.file_data = formData
                this._gestionPqrsService.loadFile(this.file_data).subscribe(res => {
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
        this._gestionPqrsService.deleteFile(id).subscribe(res => {
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
     * Delete the pqrss
     */
    deletePqrs(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar pqrs',
            message: 'Está seguro de que desea eliminar este pqrs ? Esta acción no se puede deshacer!',
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
                // Get the current pqrss's id
                const id = this.pqrs.id;

                // Get the next/previous pqrss's id
                const currentpqrsIndex = this.pqrss.findIndex(item => item.id === id);
                const nextpqrsIndex = currentpqrsIndex + ((currentpqrsIndex === (this.pqrss.length - 1)) ? -1 : 1);
                const nextpqrsId = (this.pqrss.length === 1 && this.pqrss[0].id === id) ? null : this.pqrs[nextpqrsIndex].id;

                // Delete the pqrss
                this._gestionPqrsService.deletePqrs(id)
                    .subscribe((isDeleted) => {

                        // Return if the pqrss wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next pqrss if available
                        if (nextpqrsId) {
                            this._router.navigate(['../', nextpqrsId], { relativeTo: this._activatedRoute });
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

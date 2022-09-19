import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Evidencias, RecepcionSolicitud } from '../recepcion-solicitud';
import { GestionSolicitudesService } from '../gestion-solicitudes.service';
import { BuscadorRepuestosComponent } from '../../buscadores/buscador-repuestos/buscador-repuestos.component';
import { BuscadorManoObraComponent } from '../../buscadores/buscador-mano-obra/buscador-mano-obra.component';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { Repuesto } from '../../gestion-repuestos/repuestos';
import { ManoObra } from '../../gestion-mano-obra/mano-obra';
import { BuscadorFuncionariosComponent } from '../../buscadores/buscador-funcionarios/buscador-funcionarios.component';
import { Funcionario } from '../../gestion-funcionarios/funcionarios';
import { BuscadorProductosComponent } from '../../buscadores/buscador-productos/buscador-productos.component';
import { ProductoPropietario, Producto } from '../../gestion-productos/productos';
import { AuthService } from 'app/core/auth/auth.service';
import { GestionProductosService } from '../../gestion-productos/gestion-productos.service';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { BuscadorTalleresComponent } from '../../buscadores/buscador-talleres/buscador-talleres.component';
import { Talleres } from '../../gestion-talleres/talleres';
import { GestionTalleresService } from '../../gestion-talleres/gestion-talleres.service';
import { GestionFuncionariosService } from '../../gestion-funcionarios/gestion-funcionarios.service';

@Component({
    selector: 'gestion-solicitudes-detail',
    templateUrl: './gestion-solicitudes-detail.component.html',
    styles: [
        `
        .mat-step-header {
            pointer-events: none !important;
        }

        .mat-stepper-horizontal {
            width: inherit;
        }

        .inventory-grid {
            grid-template-columns: 10% 10% 10% 10% 10% 10% 10% 10% 10%;
        }

        .mat-form-field .mat-form-field-infix {
            padding: 0px !important;
            border-top: 0px !important;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionSolicitudesDetailComponent implements OnInit, OnDestroy {

    @Input()
    externo: boolean = false;

    tituloFormulario: string = "Registro de solicitud";
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    solicitud: RecepcionSolicitud;
    solicitudForm: FormGroup;
    solicitudes: RecepcionSolicitud[];
    selected: RecepcionSolicitud;
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    idUsuario: string;
    estadoCreada: boolean = false;
    estadoEnDiagnostico: boolean = false;
    estadoEnviada: boolean = false;
    estadoEvaluada: boolean = false;
    estadoAsignada: boolean = false;
    estadoResuelta: boolean = false;
    estadoEntregada: boolean = false;
    bitacora$ = this._gestionSolicitudesService.bitacora$;
    repuestos$ = this._gestionSolicitudesService.repuestos$;
    manosObra$ = this._gestionSolicitudesService.manosObra$;
    listadoBitacora: any[];
    loadBitacora: boolean = false;
    listadoRepuestos: Repuesto[] = [];
    listadoManoObra: ManoObra[] = [];
    total: number = 0;
    estadoCotizacion: string = '';
    selectedFiles: FileList;
    imagenes: Evidencias[];
    url: any;
    file_data: any = '';
    cargoNuevaEvidencia: boolean = false;
    puedeAsignar: boolean = false;
    labelVolver: string = "Volver a las solicitudes"
    linkVolver: string = "..";
    producto: ProductoPropietario;
    usuarioSoloConsulta: boolean = false;
    usuarioSeleccionaTaller: boolean = true;
    idJefeTaller: string = null;
    historialSolicitud: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionSolicitudesService: GestionSolicitudesService,
        private _formBuilder: FormBuilder,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _notificationsService: NotificationsService,
        private _aut: AuthService,
        private _activatedRoute: ActivatedRoute,
        private _gestionProductosService: GestionProductosService,
        private _gestionFuncionariosService: GestionFuncionariosService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.producto = new ProductoPropietario;
        if (this.externo || this._aut.accessAdmin == 'importador') {
            this.externo = true;
            if (this._router.url.includes('historial-solicitud')) {
                this.tituloFormulario = "Historial de recepción de solicitud";
                this.historialSolicitud = true;
            } else {
                this.tituloFormulario = "Revisión de recepción de solicitud";
            }
        }
        if (this._aut.accessAdmin == 'administrador' || this._aut.accessJefe == 'SI') {
            this.puedeAsignar = true;
        }
        this.imagenes = [];
        this.loadBitacora = false;
        this.estadoCotizacion = 'Cotización NO EVALUADA';
        // Create the solicitud form
        this.solicitudForm = this._formBuilder.group({
            id: [''],
            uuid: [''],
            id_producto: [''],
            codigo_producto: [''],
            serial_producto: [''],
            id_referencia: [''],
            marca_producto: [''],
            propietario_producto: [''],
            tipo_recepcion: [''],
            identificacion: [''],
            nombres: [null],
            apellidos: [null],
            telefono: [null],
            correo: [null],
            ciudad: [null],
            fecha_ingreso: [null],
            horas_uso: [null],
            descripcion_falla: [null],
            diagnostico_falla: [null],
            id_estado_actual: [null],
            estado: [null],
            nombre_funcionario: [null],
            id_funcionario: [null],
            respuesta_asignacion: [null],
            es_garantia: [null],
            observacion_diagnostico: [null],
            observacion_respuesta: [null],
            respuesta: [null],
            fecha_venta: [null],
            numero_factura: [null],
            fecha_venta_usuario: [null],
            numero_factura_usuario: [null],
            nombre_distribuidor: [null],
            nombre_creador: [null],
            transportadora: [null],
            numero_guia: [null],
            id_taller: [null],
            nombre_taller: [null],
            nombre_marca: [null],
            nombre_importador: [null],
            correo_importador: [null],
            correo_distribuidor: [null],
            correo_taller: [null],
            correo_diagnostico: [null],
            correo_contabilidad: [null],
        });

        // Get the solicitudes
        this._gestionSolicitudesService.solicitudes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((solicitudes: RecepcionSolicitud[]) => {
                this.solicitudes = solicitudes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the solicitud
        this._gestionSolicitudesService.solicitud$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((solicitud: RecepcionSolicitud) => {

                // Get the solicitud
                this.solicitud = solicitud;

                if (solicitud != null) {

                    if (this.externo || this._aut.accessAdmin == 'importador') {
                        this.externo = true;
                        if (this._router.url.includes('historial-solicitud')) {
                        } else {
                            this._gestionSolicitudesService.confirmarLectura(solicitud.id).subscribe(data => {
                                console.log("lectura confirmada")
                            });
                        }
                    }

                    if (this._aut.accessAdmin == 'distribuidor') {
                        this.usuarioSoloConsulta = false;
                    } else if (this._aut.accessAdmin == 'importador') {
                        this.usuarioSoloConsulta = true;
                    } else {
                        this.usuarioSoloConsulta = false;
                    }

                    if (this._aut.accessAdmin == 'funcionario' || this._aut.accessAdmin == 'taller autorizado') {
                        this.solicitudForm.get('id_taller').setValue(this._aut.accessTaller);
                        this.solicitudForm.get('nombre_taller').setValue(this._aut.accessCompany);
                        this.usuarioSeleccionaTaller = false;
                    }

                    this.redireccionarFormulario();

                    this.editMode = true;

                    this.cargarBitacora();

                    this.repuestos$ = this._gestionSolicitudesService.getRepuestosPorIdSolicitud(this.solicitud.id);
                    this.repuestos$.subscribe(data => {
                        data.forEach(repuesto => {
                            const rep = new Repuesto();
                            rep.id = repuesto.id_repuesto;
                            rep.nombre = repuesto.nombre;
                            rep.cantidad = repuesto.cantidad;
                            rep.valor_unitario = repuesto.valor_unitario;
                            rep.total = rep.cantidad * rep.valor_unitario;
                            rep.observaciones = repuesto.observaciones;
                            this.listadoRepuestos.push(rep)

                            const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
                            const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

                            this.total = Number(totalRepuestos) + Number(totalManoObra)
                        })
                        this.loadBitacora = true;
                        this._changeDetectorRef.markForCheck();
                    })

                    this.manosObra$ = this._gestionSolicitudesService.getManosObraPorIdSolicitud(this.solicitud.id);
                    this.manosObra$.subscribe(data => {
                        data.forEach(manoObra => {
                            const mano = new ManoObra();
                            mano.id = manoObra.id_mano_obra;
                            mano.nombre = manoObra.nombre;
                            mano.cantidad = manoObra.cantidad;
                            mano.valor_unitario = manoObra.valor_unitario;
                            mano.total = mano.cantidad * mano.valor_unitario;
                            mano.observaciones = manoObra.observaciones;
                            this.listadoManoObra.push(mano)

                            const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
                            const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

                            this.total = Number(totalRepuestos) + Number(totalManoObra)
                        })

                        this.loadBitacora = true;
                        this._changeDetectorRef.markForCheck();
                    })

                    this._gestionSolicitudesService.getFile(solicitud.id).subscribe(imgs => {
                        imgs.forEach(img => {
                            img.imagen = "data:image/png;base64," + img.imagen;
                            this.imagenes.push(img);
                        })
                        this._changeDetectorRef.markForCheck();
                    });

                    this.validarEstadoSolicitud(solicitud);

                } else {
                    this.solicitudForm.reset();
                    this.editMode = false;
                    this.solicitud = new RecepcionSolicitud();
                    this.solicitud.id_estado_actual = '1';

                    if (this._aut.accessAdmin == 'funcionario' || this._aut.accessAdmin == 'taller autorizado') {
                        this.solicitudForm.get('id_taller').setValue(this._aut.accessTaller);
                        this.solicitudForm.get('nombre_taller').setValue(this._aut.accessCompany);
                        this.usuarioSeleccionaTaller = false;
                    }

                    this.redireccionarFormulario();

                    this._gestionProductosService.getProductoByIdParaSolicitud(this._activatedRoute.snapshot.paramMap.get('pr')).subscribe(prd => {
                        this.producto = prd;
                        this.solicitudForm.get('id_producto').setValue(prd.id);
                        this.solicitudForm.get('codigo_producto').setValue(prd.serial);
                        this.solicitudForm.get('serial_producto').setValue(prd.nombre_referencia);
                        this.solicitudForm.get('id_referencia').setValue(prd.id_referencia);
                        this.solicitudForm.get('marca_producto').setValue(prd.nombre_tipo_producto);
                        this.solicitudForm.get('fecha_venta').setValue(prd.fecha_venta);
                        this.solicitudForm.get('numero_factura').setValue(prd.numero_factura);
                        this.solicitudForm.get('fecha_venta_usuario').setValue(prd.fecha_venta_usuario);
                        this.solicitudForm.get('numero_factura_usuario').setValue(prd.numero_factura_usuario);
                        this.solicitudForm.get('nombre_distribuidor').setValue(prd.nombre_distribuidor);
                        this.solicitudForm.get('identificacion').setValue(prd.identificacion_propietario);
                        this.solicitudForm.get('nombres').setValue(prd.nombres_propietario);
                        this.solicitudForm.get('apellidos').setValue(prd.apellidos_propietario);
                        this.solicitudForm.get('telefono').setValue(prd.telefono_propietario);
                        this.solicitudForm.get('correo').setValue(prd.correo_propietario);
                        this.solicitudForm.get('ciudad').setValue(prd.direccion_propietario);
                        this.solicitudForm.get('nombre_marca').setValue(prd.nombre_marca);
                        this.solicitudForm.get('nombre_importador').setValue(prd.nombre_importador);
                        this.solicitudForm.get('correo_importador').setValue(prd.correo_importador);
                    })

                    this._changeDetectorRef.markForCheck();
                }

                // Patch values to the form
                this.solicitudForm.patchValue(solicitud);


                // Mark for check
                this._changeDetectorRef.markForCheck();

            });

    }

    redireccionarFormulario() {
        if (null != this._activatedRoute.snapshot.paramMap.get('previousUrl')) {
            if (this._activatedRoute.snapshot.paramMap.get('previousUrl') == 'hv') {
                this.labelVolver = "Volver al detalle del producto"
                this.linkVolver = "/detalle-producto/" + this._activatedRoute.snapshot.paramMap.get('pr');
            } else if (this._activatedRoute.snapshot.paramMap.get('previousUrl') == 'prd') {
                this.labelVolver = "Volver al detalle del producto"
                this.linkVolver = "/gestion-productos/" + this._activatedRoute.snapshot.paramMap.get('pr');
            }
        }
    }

    validarEstadoSolicitud(solicitud: RecepcionSolicitud) {
        if (solicitud.id_estado_actual == '1') {
            this.estadoCotizacion = 'SIN COTIZACIÓN';
            this.estadoCreada = true;
        } else if (solicitud.id_estado_actual == '2') {
            this.estadoCotizacion = 'ESPERANDO DIAGNÓSTICO';
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
        } else if (solicitud.id_estado_actual == '3') {
            this.estadoCotizacion = 'COTIZACIÓN AUN SIN EVALUAR';
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
            this.estadoEnviada = true;
        } else if (solicitud.id_estado_actual == '4') {
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
            this.estadoEnviada = true;
            this.estadoEvaluada = true;
            if (solicitud.garantia_aprobada == 1) {
                this.estadoCotizacion = 'GARANTÍA APROBADA';
            } else if (solicitud.garantia_aprobada == 2) {
                this.estadoCotizacion = 'GARANTÍA NO APROBADA';
            }
        } else if (solicitud.id_estado_actual == '5') {
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
            this.estadoEnviada = true;
            this.estadoEvaluada = true;
            this.estadoAsignada = true;
            if (solicitud.garantia_aprobada == 1) {
                this.estadoCotizacion = 'GARANTÍA APROBADA';
            } else if (solicitud.garantia_aprobada == 2) {
                this.estadoCotizacion = 'GARANTÍA NO APROBADA';
            }
        } else if (solicitud.id_estado_actual == '6') {
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
            this.estadoEnviada = true;
            this.estadoEvaluada = true;
            this.estadoAsignada = true;
            this.estadoResuelta = true;
            if (solicitud.garantia_aprobada == 1) {
                this.estadoCotizacion = 'GARANTÍA APROBADA';
            } else if (solicitud.garantia_aprobada == 2) {
                this.estadoCotizacion = 'GARANTÍA NO APROBADA';
            }
        } else if (solicitud.id_estado_actual == '7') {
            this.estadoCreada = true;
            this.estadoEnDiagnostico = true;
            this.estadoEnviada = true;
            this.estadoEvaluada = true;
            this.estadoAsignada = true;
            this.estadoResuelta = true;
            this.estadoEntregada = true;
            if (solicitud.garantia_aprobada == 1) {
                this.estadoCotizacion = 'GARANTÍA APROBADA';
            } else if (solicitud.garantia_aprobada == 2) {
                this.estadoCotizacion = 'GARANTÍA NO APROBADA';
            }
        }
    }

    cargarBitacora() {
        this.bitacora$ = this._gestionSolicitudesService.getBitacoraPorIdSolicitud(this.solicitud.id);

        this.bitacora$.subscribe(data => {
            this.listadoBitacora = data;
            this.loadBitacora = true;
            this._changeDetectorRef.markForCheck();
        })
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
     * Update the solicitud
     */
    updateSolicitud(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();

        if (this.solicitud?.id == null) {

            solicitud.id_usuario = localStorage.getItem('accessUserId');
            solicitud.id_estado_actual = 1;
            solicitud.estado = 1;

            if (this._aut.accessAdmin == 'administrador') {
                solicitud.creado_por = 'SERVITECO';
                solicitud.id_creador = 1;
                solicitud.nombre_creador = 'SERVITECO';
            } else if (this._aut.accessAdmin == 'distribuidor') {
                solicitud.creado_por = 'distribuidor';
                solicitud.id_creador = this._aut.accessDistribuidor;
                solicitud.nombre_creador = this._aut.accessCompany;
            } else if (this._aut.accessAdmin == 'importador') {
                solicitud.creado_por = 'importador';
                solicitud.id_creador = this._aut.accessImportador;
                solicitud.nombre_creador = this._aut.accessCompany;
            } else if (this._aut.accessAdmin == 'taller autorizado') {
                solicitud.creado_por = 'taller autorizado';
                solicitud.id_creador = this._aut.accessTaller;
                solicitud.nombre_creador = this._aut.accessCompany;
            } else if (this._aut.accessAdmin == 'funcionario') {
                solicitud.creado_por = 'Jefe de taller';
                solicitud.id_creador = this._aut.accessTaller;
                solicitud.nombre_creador = this._aut.accessCompany;
            }

            // Update the actividades on the server
            this._gestionSolicitudesService.createSolicitud(solicitud).subscribe((newSolicitud) => {
                this._notificationsService.create(solicitud.id_usuario, "Registro de nueva recepción de solicitud", `La solicitud con código ${newSolicitud.id} ha sido registrada para su gestión`).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
                Swal.fire({
                    title: 'solicitud registrada exitosamente',
                    icon: 'info',
                    timer: 1000
                })
                this.solicitud = newSolicitud;
                this.solicitudForm.reset();
                this.validarEstadoSolicitud(solicitud);
                this._changeDetectorRef.markForCheck();
            });
        } else {

            if (solicitud.id_estado_actual == 1) {

                if (this.listadoRepuestos.length == 0 && this.listadoManoObra.length == 0) {
                    Swal.fire({
                        title: 'Para enviar la cotización de la solicitud, debe agregar repuestos o mano de obra',
                        icon: 'error',
                        timer: 1000
                    })
                    return;
                }

                solicitud.id_producto = 1;
                solicitud.id_usuario = 1;
                solicitud.id_estado_actual = 2;
                solicitud.estado = 2;
                solicitud.repuestos = this.listadoRepuestos;
                solicitud.manosObra = this.listadoManoObra;

                this._gestionSolicitudesService.envioSolicitud(solicitud?.id, solicitud).subscribe(() => {
                    this.editMode = true;
                    this.validarEstadoSolicitud(solicitud);
                    this._changeDetectorRef.markForCheck();
                    Swal.fire({
                        title: 'solicitud enviada exitosamente',
                        icon: 'info',
                        timer: 1000
                    })

                });
            } else {
                // Update the actividades on the server
                this._gestionSolicitudesService.updateSolicitud(solicitud?.id, solicitud).subscribe(() => {
                    this.editMode = true;
                    this._changeDetectorRef.markForCheck();
                    this.validarEstadoSolicitud(solicitud);
                    Swal.fire({
                        title: 'solicitud modificada exitosamente',
                        icon: 'info',
                        timer: 1000
                    })

                });
            }


        }
    }

    /**
     * Update the solicitud
     */
    guardarDiagnosticoSolicitud(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();

        if (this.listadoRepuestos.length == 0 && this.listadoManoObra.length == 0) {
            Swal.fire({
                title: 'Para enviar el diagnóstico de la solicitud, debe agregar repuestos o mano de obra',
                icon: 'error',
                timer: 1000
            })
            return;
        }

        solicitud.id_producto = 1;
        solicitud.id_usuario = localStorage.getItem('accessUserId');
        solicitud.id_estado_actual = 3;
        solicitud.estado = 1;
        solicitud.repuestos = this.listadoRepuestos;
        solicitud.manosObra = this.listadoManoObra;

        if (solicitud.tipo_recepcion == 'Servicio Técnico') {
            solicitud.id_estado_actual = 4;
            this._gestionSolicitudesService.envioSolicitudServicioTecnico(solicitud?.id, solicitud).subscribe(() => {
                this.editMode = true;
                this._router.navigate(['gestion-solicitudes']);
                this._changeDetectorRef.markForCheck();
                Swal.fire({
                    title: 'Diagnóstico de solicitud enviado exitosamente',
                    icon: 'info',
                    timer: 1000
                })

            });
        } else {
            this._gestionSolicitudesService.envioSolicitud(solicitud?.id, solicitud).subscribe(() => {
                this.editMode = true;
                this._router.navigate(['gestion-solicitudes']);
                this._changeDetectorRef.markForCheck();
                Swal.fire({
                    title: 'Solicitud enviada exitosamente',
                    icon: 'info',
                    timer: 1000
                })

            });
        }

    }

    /**
    * Update the solicitud
    */
    actualizarEnvioDiagnosticoSolicitud(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();

        if (this.listadoRepuestos.length == 0 && this.listadoManoObra.length == 0) {
            Swal.fire({
                title: 'Para enviar el diagnóstico de la solicitud, debe agregar repuestos o mano de obra',
                icon: 'error',
                timer: 1000
            })
            return;
        }

        solicitud.id_producto = 1;
        solicitud.id_usuario = localStorage.getItem('accessUserId');
        solicitud.id_estado_actual = 3;
        solicitud.estado = 1;
        solicitud.repuestos = this.listadoRepuestos;
        solicitud.manosObra = this.listadoManoObra;

        this._gestionSolicitudesService.actualizacionEnvioDiagosticoSolicitud(solicitud?.id, solicitud).subscribe(() => {
            this.editMode = true;
            this._router.navigate(['gestion-solicitudes']);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud modificada y enviada exitosamente',
                icon: 'info',
                timer: 1000
            })
        });

    }

    /**
        * Update the solicitud
        */
    reenviarCorreo(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();

        this._gestionSolicitudesService.envioSolicitud(solicitud?.id, solicitud).subscribe(() => {
            this.editMode = true;
            this._router.navigate(['gestion-solicitudes']);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud reenviada exitosamente',
                icon: 'info',
                timer: 1000
            })

        });

    }

    /**
     * Update the solicitud status No Aprobado
     */
    AprobarNoAprobarCotizacionSolicitud(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();
        solicitud.id_producto = 1;
        solicitud.id_estado_actual = 4;
        solicitud.estado = 1;
        solicitud.id_usuario = this.solicitud.id_usuario;

        if (solicitud.respuesta == 'No se aprueba solicitud de garantía') {
            solicitud.garantia_aprobada = 2;
        } else {
            solicitud.garantia_aprobada = 1;
        }

        this.solicitud.id_estado_actual = '4';
        // Update the actividades on the server

        this._gestionSolicitudesService.updateEvaluacionSolicitud(solicitud?.id, solicitud).subscribe(() => {
            this._notificationsService.create(solicitud.id_usuario, "Evaluación de recepción", `La solicitud con código ${solicitud.id} ha sido evaluada por el importador`).subscribe(() => {
                this._changeDetectorRef.markForCheck();
            })
            this.editMode = true;
            this.validarEstadoSolicitud(solicitud);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud evaluada exitosamente',
                icon: 'info',
                timer: 1000
            })
        });

    }

    /**
    * Update the solicitud asignacion funcionario
    */
    asignarSolicitud(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();
        solicitud.id_producto = 1;
        solicitud.id_usuario = solicitud.id_funcionario;
        solicitud.id_usuario_asignado = localStorage.getItem('accessUserId');
        solicitud.estado = 1;

        // Update the actividades on the server
        this._gestionSolicitudesService.asignacionSolicitud(solicitud?.id, solicitud).subscribe(() => {
            this._notificationsService.create(solicitud.id_usuario, "Asignación de solicitud", `La solicitud con código ${solicitud.id} ha sido asignada para su gestión oportuna`).subscribe(() => {
                this._changeDetectorRef.markForCheck();
            })
            this.editMode = true;
            this._router.navigate(['gestion-solicitudes']);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud asignada exitosamente',
                icon: 'info',
                timer: 1000
            })
        });
    }

    /**
    * Update the solicitud asignacion funcionario para diagnostico
    */
    asignarSolicitudParaDiagnostico(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();
        solicitud.id_producto = 1;
        solicitud.id_usuario = solicitud.id_funcionario;
        solicitud.id_usuario_asignado = localStorage.getItem('accessUserId');
        solicitud.id_estado_actual = 2;
        solicitud.estado = 1;

        // Update the actividades on the server

        this._gestionSolicitudesService.asignacionDiagosticoSolicitud(solicitud?.id, solicitud).subscribe(() => {
            this._notificationsService.create(solicitud.id_usuario, "Diagnóstico de solicitud", `La solicitud con código ${solicitud.id} ha sido asignada para su diagnóstico`).subscribe(() => {
                this._changeDetectorRef.markForCheck();
            })
            this.editMode = true;
            this._router.navigate(['gestion-solicitudes']);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud asignada exitosamente',
                icon: 'info',
                timer: 1000
            })
        });

    }

    /**
         * Update the solicitud
         */
    updateSolicitudEntregaCliente(): void {
        // Get the actividades object
        const solicitud = this.solicitudForm.getRawValue();
        solicitud.id_usuario = localStorage.getItem('accessUserId');
        solicitud.id_usuario_asignado = localStorage.getItem('accessUserId');
        solicitud.id_estado_actual = 7;
        solicitud.estado = 1;

        // Update the actividades on the server
        this._gestionSolicitudesService.entregaSolicitud(solicitud?.id, solicitud).subscribe((editSolicitud) => {
            this.editMode = true;
            this.solicitud.id_estado_actual = "7";
            this.validarEstadoSolicitud(solicitud);
            this._changeDetectorRef.markForCheck();
            Swal.fire({
                title: 'Solicitud modificada exitosamente',
                icon: 'info',
                timer: 1000
            })

        });




    }

    /**
     * Delete solicitud
     */
    deleteSolicitud(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar solicitud',
            message: 'Está seguro de eliminar la solicitud? Esta acción no se puede deshacer!',
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
                // Get the current solicitudes id
                const id = this.solicitud.id;

                // Delete the contact
                this._gestionSolicitudesService.deleteSolicitud(id)
                    .subscribe((request) => {

                        if (request['mensaje'] == 'OK') {

                            this.editMode = true;
                            this._router.navigateByUrl('/solicitudes');
                            this._changeDetectorRef.markForCheck();
                            Swal.fire({
                                title: 'Solicitud eliminada exitosamente',
                                icon: 'info',
                                timer: 1000
                            })
                        } else {

                            this.editMode = true;
                            this._changeDetectorRef.markForCheck();
                            Swal.fire({
                                title: 'No es posible eliminar esta solicitud',
                                icon: 'error',
                                timer: 1000
                            })
                        }

                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }

    /**
    * Open compose dialog
    */
    openBuscadorRepuestos(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorRepuestosComponent, {
            disableClose: true,
            data: {
                idUsuario: this.idUsuario,
                id_marca: this.solicitud.id_marca,
                id_categoria: this.solicitud.id_tipo_producto,
                id_referencia: this.solicitud.id_referencia,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const item: Repuesto = result[1];
                item.id = item.id;
                item.cantidad = 1;
                item.valor_unitario = 0;
                item.total = item.valor_unitario;

                if (this.listadoRepuestos.filter(t => t.id === item.id).length > 0) {
                    Swal.fire({
                        title: 'Ya existe repuesto agregado en la cotización',
                        icon: 'error',
                        timer: 1000
                    })
                } else {
                    this.listadoRepuestos.push(item);

                    const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
                    const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

                    this.total = Number(totalRepuestos) + Number(totalManoObra)

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }

            });
    }

    onChangeCantidadRepuesto(cantidad: string, item: Repuesto, index: number): void {
        if (Number(cantidad) == 0) {
            item.cantidad = 1;
        } else {
            item.cantidad = Number(cantidad);
        }
        item.total = Number(item.valor_unitario) * item.cantidad;
        this.listadoRepuestos.splice(index, 1);
        this.listadoRepuestos.splice(index, 0, item);

        const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
        const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

        this.total = Number(totalRepuestos) + Number(totalManoObra)
    }

    onChangeValorUnitarioRepuesto(valorUnitario: string, item: Repuesto, index: number): void {
        if (Number(valorUnitario) == 0) {
            item.valor_unitario = 1;
        } else {
            item.valor_unitario = Number(valorUnitario);
        }
        item.total = Number(item.valor_unitario) * item.cantidad;
        this.listadoRepuestos.splice(index, 1);
        this.listadoRepuestos.splice(index, 0, item);

        const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
        const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

        this.total = Number(totalRepuestos) + Number(totalManoObra)
    }

    onChangeObservacionesRepuesto(observaciones: string, item: Repuesto, index: number): void {
        item.observaciones = observaciones;
        this.listadoRepuestos.splice(index, 1);
        this.listadoRepuestos.splice(index, 0, item);
    }

    onChangeCantidadManoObra(cantidad: string, item: ManoObra, index: number): void {
        if (Number(cantidad) == 0) {
            item.cantidad = 1;
        } else {
            item.cantidad = Number(cantidad);
        }
        item.total = Number(item.valor_unitario) * item.cantidad;
        this.listadoManoObra.splice(index, 1);
        this.listadoManoObra.splice(index, 0, item);

        const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
        const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

        this.total = Number(totalRepuestos) + Number(totalManoObra)
    }


    onChangeObservacionesManoObra(observaciones: string, item: ManoObra, index: number): void {
        item.observaciones = observaciones;
        this.listadoManoObra.splice(index, 1);
        this.listadoManoObra.splice(index, 0, item);
    }

    /**
    * Open compose dialog
    */
    openBuscadorManoObra(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorManoObraComponent, {
            disableClose: true,
            data: {
                idUsuario: this.idUsuario,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const item: ManoObra = result[1];
                item.id = item.id;
                item.cantidad = 1;
                item.total = item.valor_unitario;

                if (this.listadoManoObra.filter(t => t.id === item.id).length > 0) {
                    Swal.fire({
                        title: 'Ya existe mano de obra agregado en la cotización',
                        icon: 'error',
                        timer: 1000
                    })
                } else {

                    this.listadoManoObra.push(item);

                    const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
                    const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

                    this.total = Number(totalRepuestos) + Number(totalManoObra)

                    // Mark for check
                    this._changeDetectorRef.markForCheck();

                }
            });
    }

    deleteRepuesto(index: number): void {
        this.listadoRepuestos.splice(index, 1);
        const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
        const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

        this.total = Number(totalRepuestos) + Number(totalManoObra)

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deleteManoObra(index: number): void {
        this.listadoManoObra.splice(index, 1);
        const totalRepuestos = this.listadoRepuestos.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);
        const totalManoObra = this.listadoManoObra.map(t => Number(t.total)).reduce((acc, value) => acc + value, 0);

        this.total = Number(totalRepuestos) + Number(totalManoObra)

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
    * Open funcionarios dialog
    */
    openBuscadorFuncionarios(): void {

        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorFuncionariosComponent, {
            disableClose: true,
            data: {
                idTaller: this.solicitud.id_taller
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Funcionario = result[1];
                this.solicitudForm.get('id_funcionario').setValue(selected.id);
                this.solicitudForm.get('nombre_funcionario').setValue(selected.nombre_completo);
                this.solicitudForm.get('correo_diagnostico').setValue(selected.correo);
            });
    }

    /**
    * Open marcas dialog
    */
    openBuscadorProductos(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorProductosComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Producto = result[1];
                this.solicitudForm.get('id_producto').setValue(selected.id);
                this.solicitudForm.get('codigo_producto').setValue(selected.serial);
                this.solicitudForm.get('serial_producto').setValue(selected.nombre_referencia);
                this.solicitudForm.get('marca_producto').setValue(selected.nombre_tipo_producto);
            });
    }

    /**
    * Open talleres dialog
    */
    openBuscadorTalleresAutorizados(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorTalleresComponent, {
            disableClose: true,
            data: {
                idImportador: this.producto.id_importador
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Talleres = result[1];
                this._gestionFuncionariosService.getFuncionarioJefeTallerByTaller(selected.id).subscribe(jefe => {
                    if (null != jefe) {
                        this.solicitudForm.get('id_taller').setValue(selected.id);
                        this.solicitudForm.get('nombre_taller').setValue(selected.nombre);
                        this.solicitudForm.get('correo_taller').setValue(selected.correo);
                        this.idJefeTaller = jefe.id;
                    } else {
                        this.solicitudForm.get('id_taller').setValue(null);
                        this.solicitudForm.get('nombre_taller').setValue(null);
                        Swal.fire({
                            title: 'El taller seleccionado debe contar con un jefe de taller asignado',
                            icon: 'error',
                            timer: 1500
                        })
                    }
                })
            });
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
                formData.append('id', this.solicitud.id);
                this.file_data = formData
                this._gestionSolicitudesService.loadFile(this.file_data).subscribe(res => {
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
        this._gestionSolicitudesService.deleteFile(id).subscribe(res => {
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

    /**
     * Toggle product details
     *
     * @param solicitudId
     */
    toggleDetails(solicitudId: string): void {
        // If the product is already selected...
        if (this.selected && this.selected.id === solicitudId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this._gestionSolicitudesService.getSolicitudById(solicitudId)
            .subscribe((solicitud) => {

                // Set the selected product
                this.selected = solicitud;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }


    public openPDF(): void {
        const hiddenDiv = document.getElementById("solicitudReport");
        hiddenDiv.style.display = 'block';
        let DATA: any = hiddenDiv;
        html2canvas(DATA).then((canvas) => {
            const imgWidth = 208;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const heightLeft = imgHeight;
            const contentDataURL = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const position = 0;
            pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
            pdf.save('recepcion_solicitud_' + this.solicitud.id + '.pdf');
        });
        hiddenDiv.style.display = 'none';
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selected = null;
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
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

    downloadPOS() {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [80, 200],
        });

        doc.setFont("helvetica");
        doc.setFontSize(8);
        let pageWidth = doc.internal.pageSize.getWidth();
        var width = doc.internal.pageSize.getWidth();
        var img = new Image()
        img.src = 'assets/images/serviteco/Logo_Serviteco.png'
        doc.addImage(img, 'png', 25, 10, 30, 20)

        doc.text('SERVICIOS TÉCNICOS AGROFORESTALES', width / 2, 35, { align: 'center' })
        doc.text('NIT 123456789-0', width / 2, 38, { align: 'center' })
        doc.text('TEL: 8250370', width / 2, 41, { align: 'center' })
        doc.text('Radicado No.', width / 2, 45, { align: 'center' })
        doc.text(this.solicitud.id, width / 2, 48, { align: 'center' })
        doc.text('Nombres: ' + this.solicitud.nombres + " " + this.solicitud.apellidos, 5, 60, { align: 'left', maxWidth: 70 })
        doc.text('Identificación: ' + this.solicitud.identificacion, 5, 65, { align: 'left' })
        doc.text('Teléfono: ' + this.solicitud.telefono, 5, 70, { align: 'left' })
        doc.text('Marca: ' + this.solicitud.marca_producto, 5, 75, { align: 'left' })
        doc.text('Tipo Recepción: ' + this.solicitud.tipo_recepcion, 5, 80, { align: 'left' })
        doc.text('Taller: ' + this.solicitud.nombre_taller, 5, 85, { align: 'left' })
        doc.text('Serial producto: ' + this.solicitud.codigo_producto, 5, 90, { align: 'left' })
        doc.text('Recepción registrada por: ' + this.solicitud.creado_por, 5, 95, { align: 'left' })
        doc.text('Fecha recepción: ' + this.solicitud.fecha_ingreso, 5, 100, { align: 'left' })
        doc.text('Horas de uso: ' + this.solicitud.horas_uso, 5, 105, { align: 'left' })
        doc.text('Fecha recepción: ' + this.solicitud.fecha_ingreso, 5, 110, { align: 'left' })
        doc.text('Referencia: ' + this.solicitud.serial_producto, 5, 115, { align: 'left' })
        doc.text('Descripción de la falla: ' + this.solicitud.descripcion_falla, 5, 120, { align: 'justify', maxWidth: 70 })
        doc.save("recepcionSolicitud_" + this.solicitud.id + ".pdf");
    }
}

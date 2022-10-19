import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Producto } from '../productos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionProductosService } from '../gestion-productos.service';
import { DialogPasswordComponent } from '../../buscadores/dialog-password/dialog-password.component';
import { MatDialog } from '@angular/material/dialog';
import { Marca } from '../../gestion-marcas/marcas';
import { BuscadorCategoriasComponent } from '../../buscadores/buscador-categorias/buscador-categorias.component';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';
import { BuscadorImportadorasComponent } from '../../buscadores/buscador-importador/buscador-importador.component';
import { BuscadorReferenciasComponent } from '../../buscadores/buscador-referencias/buscador-referencias.component';
import { Referencia } from '../../gestion-referencias/referencias';
import { BuscadorDistribuidoresComponent } from '../../buscadores/buscador-distribuidor/buscador-distribuidor.component';
import { Distribuidor } from '../../gestion-distribuidores/distribuidores';
import { DialogMapaComponent } from '../../buscadores/dialog-mapa/dialog-mapa.component';
import Swal from 'sweetalert2';
import { BuscadorMarcasImportadorComponent } from '../../buscadores/buscador-marcas-importador/buscador-marcas-importador.component';
import { DialogUsuarioFinalComponent } from '../../buscadores/dialog-usuario-final/dialog-usuario-final.component';
import { UsuarioFinal } from '../../gestion-usuario-final/usuario-final';
import { AuthService } from 'app/core/auth/auth.service';
import { Ubicacion } from '../../buscadores/dialog-mapa/ubicacion';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { GestionReferenciasService } from '../../gestion-referencias/gestion-referencias.service';
import { GestionUsuarioFinalService } from '../../gestion-usuario-final/gestion-usuario-final.service';
import { GestionSolicitudesService } from '../../gestion-solicitudes/gestion-solicitudes.service';
import { RecepcionSolicitud } from '../../gestion-solicitudes/recepcion-solicitud';

@Component({
    selector: 'gestion-productos-detail',
    templateUrl: './gestion-productos-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionProductosDetailComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    producto: Producto;
    productoForm: FormGroup;
    productos: Producto[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedFiles: FileList;
    file_data: any = '';
    imagenBase64 = "";
    cargaNuevaFoto: boolean = false;
    editPassword: boolean = false;
    serial: String
    textoGarantia: string;
    puedeSeleccionarDistribuidor: boolean = false;
    puedeSeleccionarImportador: boolean = false;
    puedeSeleccionarReferencia: boolean = false;
    listadoUsuario: UsuarioFinal[];
    usuarioTallerAutorizado: boolean = false;
    usuarioFuncionario: boolean = false;
    verEstadoGarantia: boolean = false;
    puedeRegistrarTransferencia: boolean = false;
    usuarioFinal: UsuarioFinal;
    listadoSolicitudes: RecepcionSolicitud[];
    puedeRegistrarRecepcionSolicitudes: boolean = false;
    usuarioConsulta: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionProductosService: GestionProductosService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _aut: AuthService,
        private _gestionReferenciasService: GestionReferenciasService,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
        private _gestionSolicitudesService: GestionSolicitudesService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.puedeRegistrarRecepcionSolicitudes = true;
        if (this._router.url.includes('info-producto')) {
            this.usuarioConsulta = true;
            this.puedeRegistrarRecepcionSolicitudes = false;
        } else {
            this.usuarioConsulta = false;
            this.puedeRegistrarRecepcionSolicitudes = true;
        }
        if (this._aut.accessAdmin == 'taller autorizado') {
            this.usuarioConsulta = true;
            this.usuarioTallerAutorizado = true;
        } else {
            this.usuarioTallerAutorizado = false;
        }
        this.listadoUsuario = [];
        // Create the producto form
        this.productoForm = this._formBuilder.group({
            id: [''],
            serial: [null],
            nombre: [null],
            descripcion: [null],
            id_marca: [null],
            id_referencia: [null],
            nombre_referencia: [null],
            nombre_marca: [null],
            id_importador: [null],
            nombre_importador: [null],
            id_tipo_producto: [null],
            nombre_tipo_producto: [null],
            estado: [''],
            id_distribuidor: [null],
            nombre_distribuidor: [null],
            ubicacion: [null],
            usuario_actual: [null],
            nombre_propietario: [null],
            garantia_meses: [null],
            fecha_venta: [null],
            numero_factura: [null],
            fecha_venta_usuario: [null],
            numero_factura_usuario: [null],
            latitud: [''],
            longitud: [''],
        });


        // Get the producto
        this._gestionProductosService.productos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((productos: Producto[]) => {
                this.productos = productos;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the productos
        this._gestionProductosService.producto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((producto: Producto) => {

                // Get the productos
                this.producto = producto;
                if (producto != null) {
                    this.productoForm.get('id').setValue(producto.id);
                    if (producto.latitud != null) {
                        this.productoForm.get('ubicacion').setValue(producto.latitud + " / " + producto.longitud);
                    }
                    if (this._aut.accessAdmin == 'administrador') {
                        this.puedeSeleccionarDistribuidor = true;
                        this.puedeSeleccionarImportador = true;
                    } else if (this._aut.accessAdmin == 'distribuidor') {
                        this.puedeSeleccionarDistribuidor = false;
                        this.puedeSeleccionarImportador = true;
                        producto.id_distribuidor = this._aut.accessDistribuidor;
                        producto.nombre_distribuidor = this._aut.accessCompany;
                    } else if (this._aut.accessAdmin == 'importador') {
                        this.puedeSeleccionarImportador = false;
                        this.puedeSeleccionarDistribuidor = true;
                        producto.id_importador = this._aut.accessImportador;
                        producto.nombre_importador = this._aut.accessCompany;
                    } else if (this._aut.accessAdmin == 'taller autorizado') {
                        this.puedeSeleccionarImportador = true;
                        this.puedeSeleccionarDistribuidor = true;
                    } else if (this._aut.accessJefe == 'SI') {
                        this.puedeSeleccionarImportador = true;
                        this.puedeSeleccionarDistribuidor = true;
                        this.usuarioFuncionario = true;
                    }
                    if (this.producto?.id_distribuidor != null) {
                        this.puedeRegistrarTransferencia = true;
                    }
                    this._gestionProductosService.getTransferenciaPropiedadById(producto.id).subscribe(data => {
                        this.listadoUsuario = data;
                        if (this.producto?.id_distribuidor == null) {
                            this.productoForm.get('nombre_propietario').setValue(this.producto.nombre_importador);
                        } else if (this.producto?.id_distribuidor != null && this.listadoUsuario.length == 0) {
                            this.productoForm.get('nombre_propietario').setValue(this.producto.nombre_distribuidor);
                        } else {
                            this.productoForm.get('nombre_propietario').setValue(this.producto.nombres_propietario + " " + this.producto.apellidos_propietario);
                        }
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
                    const diferenciaMeses = this.calcularTiempoGarantia(producto.fecha_venta_usuario);
                    if (Number(diferenciaMeses) < Number(producto.garantia_meses)) {
                        this.textoGarantia = "Garantía vigente";
                    } else {
                        this.textoGarantia = "Garantía vencida";
                    }
                    this._gestionReferenciasService.getFile(producto.id_referencia).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                        this._changeDetectorRef.markForCheck();
                    });

                    this._gestionUsuarioFinalService.getUsuarioFinalById(producto.usuario).subscribe(usuFin => {
                        this.usuarioFinal = usuFin;
                        this._changeDetectorRef.markForCheck();
                    });

                    this._gestionSolicitudesService.getSolicitudesPorProducto(producto.id).subscribe(solicitudes => {
                        this.listadoSolicitudes = solicitudes;
                        this._changeDetectorRef.markForCheck();
                    });
                    // Toggle the edit mode off
                    this.toggleEditMode(true);
                } else {
                    this.puedeRegistrarTransferencia = false;
                    this.editPassword = false;
                    this.productoForm.reset();
                    producto = new Producto();
                    if (this._aut.accessAdmin == 'administrador') {
                        this.puedeSeleccionarDistribuidor = true;
                        this.puedeSeleccionarImportador = true;
                    } else if (this._aut.accessAdmin == 'distribuidor') {
                        this.puedeSeleccionarDistribuidor = false;
                        this.puedeSeleccionarImportador = true;
                        producto.id_distribuidor = this._aut.accessDistribuidor;
                        producto.nombre_distribuidor = this._aut.accessCompany;
                    } else if (this._aut.accessAdmin == 'importador') {
                        this.puedeSeleccionarImportador = false;
                        this.puedeSeleccionarDistribuidor = true;
                        producto.id_importador = this._aut.accessImportador;
                        producto.nombre_importador = this._aut.accessCompany;
                    } else if (this._aut.accessAdmin == 'taller autorizado') {
                        this.puedeSeleccionarImportador = true;
                        this.puedeSeleccionarDistribuidor = true;
                    } else if (this._aut.accessJefe == 'SI') {
                        this.puedeSeleccionarImportador = true;
                        this.puedeSeleccionarDistribuidor = true;
                        this.usuarioFuncionario = true;
                    }
                    this.toggleEditMode(true);
                }

                // Patch values to the form
                this.productoForm.patchValue(producto);

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
     * Update the productos
     */
    updateProducto(): void {
        // Get the productos object
        const producto = this.productoForm.getRawValue();
        producto.transferencia = this.listadoUsuario;
        if (this.listadoUsuario.length > 0) {
            producto.usuario_actual = this.listadoUsuario.slice(-1)[0].id;
        }

        if (producto.id == null) {
            if (this._aut.accessAdmin == 'administrador') {
                producto.creado_por = 'SERVITECO';
                producto.id_creador = 1;
                producto.nombre_creador = 'SERVITECO';
            } else if (this._aut.accessAdmin == 'distribuidor') {
                producto.creado_por = 'distribuidor';
                producto.id_creador = this._aut.accessDistribuidor;
                producto.nombre_creador = this._aut.accessCompany;
            } else if (this._aut.accessAdmin == 'importador') {
                producto.creado_por = 'importador';
                producto.id_creador = this._aut.accessImportador;
                producto.nombre_creador = this._aut.accessCompany;
            } else if (this._aut.accessAdmin == 'taller autorizado' || this._aut.accessJefe == 'SI') {
                producto.creado_por = 'taller autorizado';
                producto.id_creador = this._aut.accessTaller;
                producto.nombre_creador = this._aut.accessCompany;
            }
            // Update the productos on the server
            this._gestionProductosService.createProducto(producto).subscribe(newProducto => {
                this._gestionProductosService.getImportadores().subscribe(() => {
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
                if (newProducto.id == '0') {
                    Swal.fire({
                        title: 'Ocurrió un error al guardar producto: ' + newProducto.mensaje,
                        icon: 'error',
                        timer: 2000
                    })
                } else {
                    this.productoForm.get('id').setValue(newProducto.id);
                    Swal.fire({
                        title: 'producto registrado exitosamente!',
                        icon: 'info',
                        timer: 1000
                    })
                }
            });
        } else {
            // Update the productos on the server
            this._gestionProductosService.updateProducto(producto.id, producto).subscribe((data) => {
                this.productoForm.get('id').setValue(data.id);
                const diferenciaMeses = this.calcularTiempoGarantia(data.fecha_venta_usuario);
                if (Number(diferenciaMeses) < Number(data.garantia_meses)) {
                    this.textoGarantia = "Garantía vigente";
                } else {
                    this.textoGarantia = "Garantía vencida";
                }
                if (producto.id_distribuidor != null) {
                    this.puedeRegistrarTransferencia = true;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }
                Swal.fire({
                    title: 'producto modificado exitosamente!',
                    icon: 'info',
                    timer: 1000
                })
                this._gestionProductosService.getTransferenciaPropiedadById(data.id).subscribe(data => {
                    this.listadoUsuario = data;
                    if (producto?.id_distribuidor == null) {
                        this.productoForm.get('nombre_propietario').setValue(producto.nombre_importador);
                    } else if (producto?.id_distribuidor != null && this.listadoUsuario.length == 0) {
                        this.productoForm.get('nombre_propietario').setValue(producto.nombre_distribuidor);
                    } else {
                        this.productoForm.get('nombre_propietario').setValue(this.listadoUsuario[this.listadoUsuario.length - 1].nombres + " " + this.listadoUsuario[this.listadoUsuario.length - 1].apellidos);
                    }
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                })
            });
        }
    }


    updateTransfProducto(): void {
        // Get the actividades object
        /*  const  producto = this.productoForm.getRawValue;

          this._gestionProductosService.updateProducto(producto.id, producto).subscribe(() => {

              this.openSnackBar("producto modificado exitosamente", "Cerrar");
          });*/
    }

    public calcularTiempoGarantia(dateFrom) {
        if (dateFrom == undefined || dateFrom == null || dateFrom == '') {
            this.verEstadoGarantia = false;
        } else {
            this.verEstadoGarantia = true;
            return new Date().getMonth() - new Date(dateFrom).getMonth() +
                (12 * (new Date().getFullYear() - new Date(dateFrom).getFullYear()))
        }
    }

    adjuntar(e: any) {
        if (e.target.files[0].type == 'image/png' ||
            e.target.files[0].type == 'image/jpeg') {
            this.cargaNuevaFoto = true;
            this.selectedFiles = e.target.files;
            this.productoForm.get('foto').setValue(e.target.files[0].name);
        } else {
            Swal.fire({
                title: 'Solo es permitido adjuntar archivos con formato png o jpg',
                icon: 'error',
                timer: 1000
            })
            this.productoForm.get('foto').setValue("");
            this.selectedFiles = undefined;
        }
    }

    /**
    * Open marcas dialog
    */
    openBuscadorMarcas(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasImportadorComponent, {
            data: {
                idImportador: this.productoForm.get('id_importador').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.productoForm.get('id_marca').setValue(selected.id);
                this.productoForm.get('nombre_marca').setValue(selected.nombre);
            });
    }

    /**
    * Open referencias dialog
    */
    openBuscadorReferencias(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorReferenciasComponent, {
            data: {
                idTipoProducto: this.productoForm.get('id_tipo_producto').value,
                idImportador: this.productoForm.get('id_importador').value,
                idMarca: this.productoForm.get('id_marca').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Referencia = result[1];
                this.productoForm.get('id_referencia').setValue(selected.id);
                this.productoForm.get('nombre_referencia').setValue(selected.nombre);
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


    /**
    * Open categorias dialog
    */
    openBuscadorImportador(): void {

        if (this._aut.accessAdmin == 'distribuidor') {
            // Open the dialog importadores distribuidor autorizado
            const dialogRef = this._matDialog.open(BuscadorImportadorasComponent, {
                data: {
                    idTaller: localStorage.getItem('accessTaller'),
                    idDistribuidor: this._aut.accessDistribuidor
                }
            });
            dialogRef.afterClosed()
                .subscribe((result) => {
                    if (!result) {
                        return;
                    }
                    const selected: TipoProducto = result[1];
                    this.productoForm.get('id_importador').setValue(selected.id);
                    this.productoForm.get('nombre_importador').setValue(selected.nombre);
                });
        } else {
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
                    this.productoForm.get('id_importador').setValue(selected.id);
                    this.productoForm.get('nombre_importador').setValue(selected.nombre);
                });
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
                this.puedeSeleccionarReferencia = true;
                this.productoForm.get('id_tipo_producto').setValue(selected.id);
                this.productoForm.get('nombre_tipo_producto').setValue(selected.nombre);
            });
    }





    /**
* Open distribuidores dialog
*/
    openBuscadorUsuario(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(DialogUsuarioFinalComponent);
        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }

                const selected: UsuarioFinal = result[1];

                this.listadoUsuario.push(selected);

                this._changeDetectorRef.markForCheck();
            });
    }


    deleteUsuarioAsociado(index: number): void {
        this.listadoUsuario.splice(index, 1);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /**
    * Open distribuidores dialog
    */
    openBuscadorDistribuidores(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorDistribuidoresComponent);

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Distribuidor = result[1];
                this.productoForm.get('id_distribuidor').setValue(selected.id);
                this.productoForm.get('nombre_distribuidor').setValue(selected.nombre);
            });
    }


    /**
    * Open mapa dialog
    */
    openMapa(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(DialogMapaComponent, {
            data: {
                latitud: Number(this.productoForm.get('latitud').value),
                longitud: Number(this.productoForm.get('longitud').value)
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Ubicacion = result[1];
                this.productoForm.get('ubicacion').setValue(selected.lat + " / " + selected.lon);
                this.productoForm.get('latitud').setValue(selected.lat);
                this.productoForm.get('longitud').setValue(selected.lon);
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
                idproducto: this.producto.id,
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
     * Delete the productos
     */
    deleteProducto(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Eliminar producto',
            message: 'Está seguro de que desea eliminar este producto ? Esta acción no se puede deshacer!',
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
                // Get the current productos's id
                const id = this.producto.id;

                // Get the next/previous productos's id
                const currentproductoIndex = this.productos.findIndex(item => item.id === id);
                const nextproductoIndex = currentproductoIndex + ((currentproductoIndex === (this.productos.length - 1)) ? -1 : 1);
                const nextproductoId = (this.productos.length === 1 && this.productos[0].id === id) ? null : this.producto[nextproductoIndex].id;

                // Delete the productos
                this._gestionProductosService.deleteProducto(id)
                    .subscribe((isDeleted) => {

                        // Return if the productos wasn't deleted...
                        if (!isDeleted) {
                            return;
                        }

                        // Navigate to the next productos if available
                        if (nextproductoId) {
                            this._router.navigate(['../', nextproductoId], { relativeTo: this._activatedRoute });
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

    public openPDF(): void {
        const hiddenDiv = document.getElementById("htmlData");
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
            pdf.save('hoja_vida_producto_' + this.producto.serial + '.pdf');
        });
        hiddenDiv.style.display = 'none';
    }

    registrarSolicitud() {

        this._router.navigate(['/gestion-solicitudes', 0, { previousUrl: 'prd', pr: this.producto.id }], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
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

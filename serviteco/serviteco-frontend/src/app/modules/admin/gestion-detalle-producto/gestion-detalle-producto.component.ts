import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GestionProductosService } from '../gestion-productos/gestion-productos.service';
import { Producto } from '../gestion-productos/productos';
import { GestionReferenciasService } from '../gestion-referencias/gestion-referencias.service';
import { GestionSolicitudesService } from '../gestion-solicitudes/gestion-solicitudes.service';
import { RecepcionSolicitud } from '../gestion-solicitudes/recepcion-solicitud';
import { GestionUsuarioFinalService } from '../gestion-usuario-final/gestion-usuario-final.service';
import { UsuarioFinal } from '../gestion-usuario-final/usuario-final';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'gestion-detalle-producto',
    templateUrl: './gestion-detalle-producto.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionDetalleProductoComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    producto: Producto;
    listadoUsuario: UsuarioFinal[];
    listadoSolicitudes: RecepcionSolicitud[];
    imagenBase64 = "";
    usuarioFinal: UsuarioFinal;
    textoGarantia: string;
    usuarioConsulta: boolean = false;
    puedeRegistrarRecepcionSolicitudes: boolean = false;
    usuarioTallerAutorizado: boolean = false;

    @ViewChild('htmlData') content: ElementRef;

    /**
     * Constructor
     */
    constructor(
        private _gestionProductosService: GestionProductosService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _gestionReferenciasService: GestionReferenciasService,
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
        private _gestionSolicitudesService: GestionSolicitudesService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _aut: AuthService) {

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

        // Get the productos
        this._gestionProductosService.producto$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((producto: Producto) => {

                // Get the productos
                this.producto = producto;

                if (producto != null) {

                    const diferenciaMeses = this.calcularTiempoGarantia(producto.fecha_venta_usuario);
                    if (Number(diferenciaMeses) < Number(producto.garantia_meses)) {
                        this.textoGarantia = "Garantía vigente";
                    } else {
                        this.textoGarantia = "Garantía vencida";
                    }

                    this._gestionProductosService.getTransferenciaPropiedadById(producto.id).subscribe(data => {
                        this.listadoUsuario = data;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })

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

                } else {
                    producto = new Producto();
                }

            });

    }

    verDetalleSolicitud(solicitud: RecepcionSolicitud) {

        this._router.navigate(['/gestion-solicitudes', solicitud.uuid, { previousUrl: 'hv' }], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    verHistorialSolicitud(solicitud: RecepcionSolicitud) {

        this._router.navigate(['/historial-solicitud', solicitud.uuid, { previousUrl: 'hv' }], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    savePdf() {
        const doc = new jsPDF();

        const pdfTable = this.content.nativeElement;

        doc.html(pdfTable.innerHTML, {
            callback(rst) {
                rst.save('one.pdf');
            },
            x: 10,
            y: 10
        });

    }

    downloadPDF() {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "in",
            format: [4, 2]
        });
        doc.text("Detalle del producto!" + this.producto.serial, 1, 1);
        //doc.save("two-by-four.pdf");
        doc.output('dataurlnewwindow');
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

        this._router.navigate(['/gestion-solicitudes', 0, { previousUrl: 'hv', pr: this.producto.id }], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    editarProducto() {

        this._router.navigate(['/registro-productos']);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    public calcularTiempoGarantia(dateFrom) {
        return new Date().getMonth() - new Date(dateFrom).getMonth() +
            (12 * (new Date().getFullYear() - new Date(dateFrom).getFullYear()))
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}

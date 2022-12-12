import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { interval, Observable, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import readXlsxFile from 'read-excel-file'
import { fuseAnimations } from '@fuse/animations';
import { StepperOrientation } from '@angular/cdk/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { BuscadorMarcasComponent } from '../../buscadores/buscador-marcas/buscador-marcas.component';
import { BuscadorImportadorasComponent } from '../../buscadores/buscador-importador/buscador-importador.component';
import { BuscadorCategoriasComponent } from '../../buscadores/buscador-categorias/buscador-categorias.component';
import { Marca } from '../../gestion-marcas/marcas';
import { TipoProducto } from '../../gestion-tipoProductos/tipoProductos';
import { Producto } from '../../gestion-productos/productos';
import { BuscadorProductosComponent } from '../../buscadores/buscador-productos/buscador-productos.component';
import { BuscadorReferenciasComponent } from '../../buscadores/buscador-referencias/buscador-referencias.component';
import { Referencia } from '../../gestion-referencias/referencias';
import { GestionProductosService } from '../../gestion-productos/gestion-productos.service';
import { BuscadorMarcasImportadorComponent } from '../../buscadores/buscador-marcas-importador/buscador-marcas-importador.component';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'gestion-carga-masiva-detail',
    templateUrl: './gestion-carga-masiva-detail.component.html',
    styles: [
        /* language=SCSS */
        `
          .audio-progress-bar {
            &.mat-progress-bar {
              height: 20px;
              border-radius: 10px;
            }

            .mat-progress-bar-fill::after {
              background-color: #37474f;
            }

            .mat-progress-bar-buffer {
              background-color: #90a4ae;
            }

            /* remove animation and the dots*/
            .mat-progress-bar-background {
              animation: none;
              background-color: #eceff1;
              fill: #eceff1;
            }
          }
        `
    ],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionCargaMasivaDetailComponent implements OnInit, OnDestroy {

    cargaMasivaForm: FormGroup;
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    terminaCargaArchivo: boolean = true;
    puedeCargarArchivo: boolean = false;
    listado: Producto[];
    selectedFiles: FileList;
    currentFileUpload: File;
    progressbarValue = 0;
    console: string = `this.fuseMockApiService
    .onPut('api/navigation')
    .reply(({request: HttpRequest<any>}) => {

        // Get the body from the request
        const body = request.body;

        // Do something with your data

        // Return a success code along with some data
        return [200, { newNavigation }];
})`;

    firstFormGroup = this._formBuilder.group({
        id_importador: null,
        nombre_importador: ['', Validators.required],
    });
    secondFormGroup = this._formBuilder.group({
        id_marca: null,
        nombre_marca: ['', Validators.required],
    });
    thirdFormGroup = this._formBuilder.group({
        id_tipo_producto: null,
        nombre_tipo_producto: ['', Validators.required],
    });
    fourFormGroup = this._formBuilder.group({
        id_referencia: null,
        nombre_referencia: ['', Validators.required],
    });
    fiveFormGroup = this._formBuilder.group({
        nombre_archivo: null,
    });
    stepperOrientation: Observable<StepperOrientation>;
    puedeSeleccionarImportador: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _snackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _router: Router,
        private _gestionProductosService: GestionProductosService,
        private breakpointObserver: BreakpointObserver,
        private _aut: AuthService
    ) {
        this.stepperOrientation = this.breakpointObserver
            .observe('(min-width: 800px)')
            .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the solicitud form
        this.cargaMasivaForm = this._formBuilder.group({
            id: [''],
        });
        this.console = ``;
        if (this._aut.accessAdmin == 'administrador') {
            this.puedeSeleccionarImportador = true;
        } else if (this._aut.accessAdmin == 'importador') {
            this.puedeSeleccionarImportador = false;
            this.firstFormGroup.get('id_importador').setValue(this._aut.accessImportador);
            this.firstFormGroup.get('nombre_importador').setValue(this._aut.accessCompany);
        } else if (this._aut.accessAdmin == 'distribuidor') {
            this.puedeSeleccionarImportador = true;
        }
    }

    adjuntar(e: any) {
        this.terminaCargaArchivo = false;
        this.listado = [];
        this.progressbarValue = 0;
        const importador = this.firstFormGroup.get('nombre_importador').value;
        const marca = this.secondFormGroup.get('nombre_marca').value;
        const categoria = this.thirdFormGroup.get('nombre_tipo_producto').value;
        const referencia = this.fourFormGroup.get('nombre_referencia').value;
        this.console = this.console.concat("<strong>Resumen de la carga masiva a realizar: </strong> <br><br>");
        this.console = this.console.concat("<strong>Importador: </strong> " + importador + " <br>");
        this.console = this.console.concat("<strong>Marca: </strong> " + marca + " <br>");
        this.console = this.console.concat("<strong>Categoria:</strong> " + categoria + " <br>");
        this.console = this.console.concat("<strong>Referencia:</strong> " + referencia + " <br><br>");

        this._changeDetectorRef.markForCheck();
        this.fiveFormGroup.get('nombre_archivo').setValue(e.target.files[0].name);

        if (e.target.files[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.selectedFiles = e.target.files;
            this.currentFileUpload = this.selectedFiles.item(0);

            readXlsxFile(this.selectedFiles.item(0)).then((rows) => {
                for (let index = 1; index < rows.length; index++) {
                    const producto = new Producto();
                    if (this._aut.accessAdmin == 'administrador') {
                        producto.creado_por = 'SERVITECO';
                        producto.id_creador = '1';
                        producto.nombre_creador = 'SERVITECO';
                        producto.id_distribuidor = rows[index][1].toString();
                    } else if (this._aut.accessAdmin == 'distribuidor') {
                        producto.creado_por = 'distribuidor';
                        producto.id_creador = this._aut.accessDistribuidor;
                        producto.nombre_creador = this._aut.accessCompany;
                        producto.id_distribuidor = this._aut.accessDistribuidor;
                    } else if (this._aut.accessAdmin == 'importador') {
                        producto.creado_por = 'importador';
                        producto.id_creador = this._aut.accessImportador;
                        producto.nombre_creador = this._aut.accessCompany;
                        producto.id_distribuidor = rows[index][1].toString();
                    }
                    producto.id_importador = this.firstFormGroup.get('id_importador').value;
                    producto.id_marca = this.secondFormGroup.get('id_marca').value;
                    producto.id_tipo_producto = this.thirdFormGroup.get('id_tipo_producto').value;

                    producto.serial = rows[index][0].toString();

                    const initalValue = producto.serial;
                    producto.serial = initalValue.replace(/[^a-zA-Z0-9]*/g, '');
                    if (initalValue !== producto.serial) {
                        this.console = this.console.concat("serial debe ser alfanumérico: " + rows[index][0] + ", no se cargará <br> ")
                    } else {
                        producto.id_referencia = this.fourFormGroup.get('id_referencia').value;
                        producto.numero_factura = rows[index][2].toString();
                        let date = new Date(rows[index][3].toString());
                        date.setHours(24);
                        producto.fecha_venta = date.toISOString();
                        producto.garantia_meses = rows[index][4].toString();
                        this.console = this.console.concat("cargando serial: " + rows[index][0] + " <br> ")
                        this.progressbarValue = index;
                        this._changeDetectorRef.markForCheck();
                        this.listado.push(producto);
                    }
                }
                const total = Number(rows.length) - Number(1);
                this._changeDetectorRef.markForCheck();
                this.selectedFiles = undefined;
                this.terminaCargaArchivo = true;
                this.progressbarValue = total;
                this.console = this.console.concat("<br> se cargarán: " + this.listado.length + " registros que pasaron las validaciones <br> ")
            })

            this._changeDetectorRef.markForCheck();

        } else {
            this.terminaCargaArchivo = true;
            this.openSnackBar("Solo es permitido adjuntar archivos con formato xlsx", "Cerrar");
            this.selectedFiles = undefined;
        }
    }

    realizarCargaMasiva(): void {
        this.console = "Guardando información... <br><br>";
        for (let producto of this.listado) {
            this._gestionProductosService.createProductoMasivo(producto).subscribe(data => {
                if (data.id == '0') {
                    this.console = this.console.concat("serial " + producto.serial + " tuvo problemas al registrarse en el sistema: " + data.mensaje + "<br>")
                } else {
                    this.console = this.console.concat("serial " + data.serial + " almacenado exitosamente con ID: " + data.id + " <br>")
                }
                this._changeDetectorRef.markForCheck();
            }, (err) => {
                this.console = this.console.concat("serial " + producto.serial + " no almacenado: " + err + "<br>")
                this._changeDetectorRef.markForCheck();
            });
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
        * Open marcas dialog
        */
    openBuscadorMarcas(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorMarcasImportadorComponent, {
            data: {
                idImportador: this.firstFormGroup.get('id_importador').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Marca = result[1];
                this.secondFormGroup.get('id_marca').setValue(selected.id);
                this.secondFormGroup.get('nombre_marca').setValue(selected.nombre);
            });
    }

    /**
    * Open categorias dialog
    */
    openBuscadorImportador(): void {
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
                this.firstFormGroup.get('id_importador').setValue(selected.id);
                this.firstFormGroup.get('nombre_importador').setValue(selected.nombre);
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
                this.thirdFormGroup.get('id_tipo_producto').setValue(selected.id);
                this.thirdFormGroup.get('nombre_tipo_producto').setValue(selected.nombre);
            });
    }

    /**
    * Open subcategorias dialog
    */
    openBuscadorReferencias(): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorReferenciasComponent, {
            data: {
                idTipoProducto: this.thirdFormGroup.get('id_tipo_producto').value,
                idImportador: this.firstFormGroup.get('id_importador').value,
                idMarca: this.secondFormGroup.get('id_marca').value
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
                const selected: Referencia = result[1];
                this.fourFormGroup.get('id_referencia').setValue(selected.id);
                this.fourFormGroup.get('nombre_referencia').setValue(selected.nombre);
            });
    }

    downloadFile() {
        let link = document.createElement("a");
        link.download = "template.xlsx";
        link.href = "assets/templates/template.xlsx";
        link.click();
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
}

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { ProjectService } from 'app/modules/admin/administrador/project.service';
import { BuscadorAvanzadoProductosComponent } from 'app/modules/admin/buscadores/buscador-avanzado-productos/buscador-avanzado-productos.component';
import { GestionEmpresasService } from 'app/modules/admin/gestion-empresas/gestion-empresas.service';
import { GestionImportadoresService } from 'app/modules/admin/gestion-importadores/gestion-importadores.service';
import { GestionProductosService } from 'app/modules/admin/gestion-productos/gestion-productos.service';
import { Paginator } from 'app/modules/admin/paginator';
import { environment } from 'environments/environment';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: FormGroup;
    administracionForm: FormGroup;
    showAlert: boolean = false;
    
    tipoBusqueda: boolean = true;
    orderBy: string = "id";
    order: string = "asc";
    filter: string = "all";
    pageIndex: number = 0;
    pageSize: number = 10;
    pageSizeInit = 10;
    imagenBase64Empresa = "";
    nombreEmpresa = "";

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _gestionProductosService: GestionProductosService,
        private _matDialog: MatDialog,
        private _gestionEmpresasService: GestionEmpresasService,
    )
    {
        console.log(this._router['location']._platformLocation.location.origin);
        let url: string = this._router['location']._platformLocation.location.origin;
        let urlHttps: string = url.replace("https://", "");
        let urlFinal: string = urlHttps.replace(".serviteco.com.co", "");
        this._gestionEmpresasService.getDatosEmpresa(urlFinal).subscribe(img => {
            if (img.imagen == '') {
                this.imagenBase64Empresa = "";
            } else {
                this.nombreEmpresa = img.nombre
                this.imagenBase64Empresa = "data:image/png;base64," + img.imagen;
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required]],
            password  : ['', Validators.required],
            rememberMe: ['']
        });

        this.administracionForm = this._formBuilder.group({
            id: [''],
            serial: [''],
            identificacion: [''],
            nombre: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                () => {

                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);

                },
                (response) => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Usuario o contraseña incorrectos'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    buscarProducto() {
        const paginator = new Paginator();
        paginator.pageIndex = this.pageIndex;
        paginator.pageSize = this.pageSize;
        paginator.filter = this.filter || 'all';
        paginator.order = this.order;
        paginator.orderBy = this.orderBy;
        
        if (this.tipoBusqueda) {
            paginator.identificacion = this.administracionForm.get('identificacion').value;
            paginator.serial = null;
            paginator.filter = this.administracionForm.get('identificacion').value;
            this._gestionProductosService.getProductoPaginatorAvanzado(paginator).subscribe(data => {
                this.openBuscadorAvanzadoProductos(paginator);
            })
        } else {
            paginator.serial = this.administracionForm.get('identificacion').value;
            paginator.identificacion = null;
            paginator.filter = this.administracionForm.get('identificacion').value;
            this._gestionProductosService.getProductoPaginatorAvanzado(paginator).subscribe(data => {
                this.openBuscadorAvanzadoProductos(paginator);
            })
        }

    }

    onNavigatePqrs(){
        window.open("/#/registro-pqrs", "_blank");
    }

    onNavigateContactenos(){
        window.open("/#/registro-contactenos", "_blank");
    }

    onNavigatePoliticaGarantia(){
        window.open("/#/politica-garantia", "_blank");
    }

    onNavigateWebMail(){
        window.open("https://webmail.serviteco.com.co/", "_blank");
    }

    /**
    * Open productos avanzado dialog
    */
     openBuscadorAvanzadoProductos(paginator: Paginator): void {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscadorAvanzadoProductosComponent, {
            data: {
                paginator: paginator,
                externo: true,
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (!result) {
                    return;
                }
            });
    }        

}

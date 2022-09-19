import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { GestionImportadoresService } from 'app/modules/admin/gestion-importadores/gestion-importadores.service';
import { GestionDistribuidoresService } from 'app/modules/admin/gestion-distribuidores/gestion-distribuidores.service';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { GestionEmpresasService } from 'app/modules/admin/gestion-empresas/gestion-empresas.service';

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    imagenBase64Empresa = "";
    imagenBase64 = "";
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    puedeBuscar: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _gestionImportadoresService: GestionImportadoresService,
        private _gestionDistribuidoresService: GestionDistribuidoresService,
        private _aut: AuthService,
        private _gestionEmpresasService: GestionEmpresasService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        if (this._aut.accessAdmin == 'funcionario' && this._aut.accessJefe == 'NO') {
            this.puedeBuscar = false;
        } 
        let url: string = this._router['location']._platformLocation.location.origin;
        let urlHttps: string = url.replace("https://", "");
        let urlFinal: string = urlHttps.replace(".serviteco.com.co", "");
        this._gestionEmpresasService.getDatosEmpresa(urlFinal).subscribe(img => {
            if (img.imagen == '') {
                this.imagenBase64Empresa = "";
            } else {
                this.imagenBase64Empresa = "data:image/png;base64," + img.imagen;
            }
        });
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
                if (this.user.admin == 'importador') {
                    this._gestionImportadoresService.getFile(this.user.importador).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                    });
                } else if (this.user.admin == 'distribuidor') {
                    this._gestionDistribuidoresService.getFile(this.user.distribuidor).subscribe(img => {
                        if (img == '') {
                            this.imagenBase64 = "";
                        } else {
                            this.imagenBase64 = "data:image/png;base64," + img;
                        }
                    });
                }
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}

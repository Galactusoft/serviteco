import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { GestionImportadoresService } from 'app/modules/admin/gestion-importadores/gestion-importadores.service';
import { environment } from 'environments/environment';
import { GestionEmpresasService } from 'app/modules/admin/gestion-empresas/gestion-empresas.service';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AuthSignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# segundo',
        'other': '# segundos'
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    imagenBase64Empresa = "";

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private _gestionEmpresasService: GestionEmpresasService,
    )
    {
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Sign out
        this._authService.signOut();

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    this._router.navigate(['inicio']);
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--)
            )
            .subscribe();
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
}

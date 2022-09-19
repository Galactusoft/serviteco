import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { GestionSolicitudesService } from 'app/modules/admin/gestion-solicitudes/gestion-solicitudes.service';
import { RecepcionSolicitud } from 'app/modules/admin/gestion-solicitudes/recepcion-solicitud';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EvaluarSolicitudSolicitudResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionSolicitudesService: GestionSolicitudesService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RecepcionSolicitud> {
        return this._gestionSolicitudesService.getSolicitudById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested Solicitud is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}
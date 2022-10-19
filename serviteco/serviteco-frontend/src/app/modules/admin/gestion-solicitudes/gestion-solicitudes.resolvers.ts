import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Paginator } from '../paginator';
import { GestionSolicitudesService } from './gestion-solicitudes.service';
import { PanelSolicitudes, RecepcionSolicitud } from './recepcion-solicitud';

@Injectable({
    providedIn: 'root'
})
export class GestionSolicitudesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionSolicitudesService: GestionSolicitudesService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        return this._gestionSolicitudesService.getRecepcionSolicitudesPaginator(paginator);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionSolicitudesPanelResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionSolicitudesService: GestionSolicitudesService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PanelSolicitudes> {
        return this._gestionSolicitudesService.getSolicitudesPanel();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionSolicitudesSolicitudesResolver implements Resolve<any>
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

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { GestionImportadoresService } from '../gestion-importadores/gestion-importadores.service';
import { GestionReferenciasService } from './gestion-referencias.service';
import { Referencia } from './referencias';

@Injectable({
    providedIn: 'root'
})
export class GestionReferenciasResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionReferenciasService: GestionReferenciasService)
    {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return forkJoin([
            this._gestionReferenciasService.getReferenciasImportadores(),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionReferenciasReferenciaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionReferenciasService: GestionReferenciasService,
        private _router: Router
    )
    {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Referencia>
    {
        return this._gestionReferenciasService.getReferenciaById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Referencia is not available
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
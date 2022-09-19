import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionImportadoresService } from './gestion-importadores.service';
import { Importador } from './Importadores';

@Injectable({
    providedIn: 'root'
})
export class GestionImportadoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionImportadoresService: GestionImportadoresService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Importador[]>
    {
        return this._gestionImportadoresService.getImportadores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionImportadoresImportadorResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionImportadoresService: GestionImportadoresService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Importador>
    {
        return this._gestionImportadoresService.getImportadorById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Importador is not available
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
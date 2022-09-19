import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionDistribuidoresService } from './gestion-distribuidores.service';
import { Distribuidor } from './distribuidores';

@Injectable({
    providedIn: 'root'
})
export class GestionDistribuidoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionDistribuidoresService: GestionDistribuidoresService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Distribuidor[]>
    {
        return this._gestionDistribuidoresService.getDistribuidores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionDistribuidoresDistribuidorResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionDistribuidoresService: GestionDistribuidoresService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Distribuidor>
    {
        return this._gestionDistribuidoresService.getDistribuidorById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Distribuidor is not available
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
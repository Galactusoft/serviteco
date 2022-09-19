import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionTalleresService } from './gestion-talleres.service';
import { Talleres } from './talleres';

@Injectable({
    providedIn: 'root'
})
export class GestionTalleresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionTalleresService: GestionTalleresService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Talleres[]>
    {
        return this._gestionTalleresService.getTalleres();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionTalleresTallerResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionTalleresService: GestionTalleresService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Talleres>
    {
        return this._gestionTalleresService.getTallerById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Taller is not available
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
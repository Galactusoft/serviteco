import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionManoObrasService } from './gestion-mano-obra.service';
import { ManoObra } from './mano-obra';

@Injectable({
    providedIn: 'root'
})
export class GestionManoObrasResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionManoObraService: GestionManoObrasService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ManoObra[]>
    {
        return this._gestionManoObraService.getManoObras();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionManoObraResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionManoObraService: GestionManoObrasService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ManoObra>
    {
        return this._gestionManoObraService.getManoObraById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Mano obra is not available
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
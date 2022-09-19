import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionMarcasService } from './gestion-marcas.service';
import { Marca } from './marcas';

@Injectable({
    providedIn: 'root'
})
export class GestionMarcasResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionMarcasService: GestionMarcasService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Marca[]>
    {
        return this._gestionMarcasService.getMarcas();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionMarcasMarcaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionMarcasService: GestionMarcasService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Marca>
    {
        return this._gestionMarcasService.getMarcaById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested marca is not available
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
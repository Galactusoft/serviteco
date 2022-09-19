import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { GestionMarcasService } from '../gestion-marcas/gestion-marcas.service';
import { Paginator } from '../paginator';
import { GestionRepuestosService } from './gestion-repuestos.service';
import { Repuesto, RepuestoPaginator } from './repuestos';

@Injectable({
    providedIn: 'root'
})
export class GestionRepuestosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionRepuestosService: GestionRepuestosService)
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
            this._gestionRepuestosService.getRepuestosMarcas(),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionRepuestosProductoResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionRepuestosService: GestionRepuestosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Repuesto>
    {
        return this._gestionRepuestosService.getRepuestoById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Repuesto is not available
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
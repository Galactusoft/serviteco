import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionTipoProductosService } from './gestion-tipoProductos.service';
import { TipoProducto } from './tipoProductos';

@Injectable({
    providedIn: 'root'
})
export class GestionTipoProductosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionTipoProductoService: GestionTipoProductosService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TipoProducto[]>
    {
        return this._gestionTipoProductoService.getTipoProductos();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionTipoProductosProductoResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionTipoProductosService: GestionTipoProductosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TipoProducto>
    {
        return this._gestionTipoProductosService.getTipoProductoById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested TipoProducto is not available
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
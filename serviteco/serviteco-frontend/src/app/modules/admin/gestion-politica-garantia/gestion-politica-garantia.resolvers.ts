import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionProductosService } from '../gestion-productos/gestion-productos.service';
import { Producto } from '../gestion-productos/productos';

@Injectable({
    providedIn: 'root'
})
export class GestionDetalleproductosProductoResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionproductosService: GestionProductosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Producto>
    {
        return this._gestionproductosService.getProductoById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested producto is not available
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
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionUsuariosService } from './gestion-usuarios.service';
import { Usuario } from './usuarios';

@Injectable({
    providedIn: 'root'
})
export class GestionUsuariosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionUsuariosService: GestionUsuariosService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Usuario[]>
    {
        return this._gestionUsuariosService.getUsuarios();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionUsuariosUsuarioResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionUsuariosService: GestionUsuariosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Usuario>
    {
        return this._gestionUsuariosService.getUsuarioById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested usuario is not available
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
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { GestionUsuarioFinalService } from './gestion-usuario-final.service';
import { UsuarioFinal } from './usuario-final';

@Injectable({
    providedIn: 'root'
})
export class GestionUsuarioFinalResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionUsuarioFinalService: GestionUsuarioFinalService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UsuarioFinal[]>
    {
        return this._gestionUsuarioFinalService.getUsuariosFinales();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionUsuarioFinalUsuarioResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionUsuarioFinalService: GestionUsuarioFinalService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UsuarioFinal>
    {
        return this._gestionUsuarioFinalService.getUsuarioFinalById(route.paramMap.get('id'))
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
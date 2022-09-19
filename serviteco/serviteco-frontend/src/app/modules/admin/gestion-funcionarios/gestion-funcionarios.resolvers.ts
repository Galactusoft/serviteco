import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Funcionario } from './funcionarios';
import { GestionFuncionariosService } from './gestion-funcionarios.service';

@Injectable({
    providedIn: 'root'
})
export class GestionFuncionariosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionFuncionariosService: GestionFuncionariosService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Funcionario[]>
    {
        return this._gestionFuncionariosService.getFuncionarios();
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionFuncionariosProductoResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionFuncionariosService: GestionFuncionariosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Funcionario>
    {
        return this._gestionFuncionariosService.getFuncionarioById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested Funcionario is not available
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
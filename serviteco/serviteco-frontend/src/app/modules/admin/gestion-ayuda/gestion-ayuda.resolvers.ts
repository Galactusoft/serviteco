import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { Paginator } from '../paginator';
import { GestionAyudaService } from './gestion-ayuda.service';
import { Ayuda } from './ayuda';

@Injectable({
    providedIn: 'root'
})
export class GestionAyudaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionAyudaService: GestionAyudaService)
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
        const paginator = new Paginator();
        paginator.pageIndex = 0;
        paginator.pageSize = 10;
        paginator.filter = "all";
        paginator.order = "asc";
        paginator.orderBy = "id";
        return forkJoin([
            this._gestionAyudaService.getAyudaPaginator(paginator),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionayudasAyudaResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionayudaService: GestionAyudaService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Ayuda>
    {
        return this._gestionayudaService.getAyudaById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested ayuda is not available
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

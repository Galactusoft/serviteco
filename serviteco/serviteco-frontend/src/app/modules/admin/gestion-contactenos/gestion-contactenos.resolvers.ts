import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { Paginator } from '../paginator';
import { GestionContactenosService } from './gestion-contactenos.service';
import { Contactenos, ContactenosPaginator } from './contactenos';

@Injectable({
    providedIn: 'root'
})
export class GestionContactenosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionContactenosService: GestionContactenosService)
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
            this._gestionContactenosService.getContactenosPaginator(paginator),
            this._gestionContactenosService.getTiposIdentificacion(),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionContactenossContactenosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionContactenosService: GestionContactenosService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Contactenos>
    {
        return this._gestionContactenosService.getContactenosById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested contactenos is not available
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
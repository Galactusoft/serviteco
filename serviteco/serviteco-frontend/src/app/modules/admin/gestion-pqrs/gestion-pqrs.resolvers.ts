import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, Observable, throwError } from 'rxjs';
import { Paginator } from '../paginator';
import { GestionPqrsService } from './gestion-pqrs.service';
import { Pqrs, PqrsPaginator } from './pqrs';

@Injectable({
    providedIn: 'root'
})
export class GestionPqrsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _gestionPqrsService: GestionPqrsService)
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
            this._gestionPqrsService.getPqrsPaginator(paginator),
            this._gestionPqrsService.getTiposIdentificacion(),
            this._gestionPqrsService.getTiposSolicitud(),
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class GestionPqrssPqrsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _gestionPqrsService: GestionPqrsService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Pqrs>
    {
        return this._gestionPqrsService.getPqrsById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested pqrs is not available
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
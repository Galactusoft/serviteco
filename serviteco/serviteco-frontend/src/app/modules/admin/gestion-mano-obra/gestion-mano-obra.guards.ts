import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionManoObrasDetailComponent } from './gestion-mano-obra-detail/gestion-mano-obra-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionManoObrasDetail implements CanDeactivate<GestionManoObrasDetailComponent>
{
    canDeactivate(
        component: GestionManoObrasDetailComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/manoObra'
        // it means we are navigating away from the
        // manoObra app
        if ( !nextState.url.includes('/gestion-mano-obra') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another Mano de obra...
        if ( nextRoute.paramMap.get('id') )
        {
            // Just navigate
            return true;
        }
        // Otherwise...
        else
        {
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => true);
        }
    }
}

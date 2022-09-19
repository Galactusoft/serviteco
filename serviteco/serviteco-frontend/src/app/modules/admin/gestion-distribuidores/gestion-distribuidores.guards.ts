import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionDistribuidoresDetailComponent } from './gestion-distribuidores-detail/gestion-distribuidores-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionDistribuidoresDetail implements CanDeactivate<GestionDistribuidoresDetailComponent>
{
    canDeactivate(
        component: GestionDistribuidoresDetailComponent,
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

        // If the next state doesn't contain '/distribuidores'
        // it means we are navigating away from the
        // distribuidores app
        if ( !nextState.url.includes('/gestion-distribuidores') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another distribuidor...
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

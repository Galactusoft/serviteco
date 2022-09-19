import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionTalleresDetailComponent } from './gestion-talleres-detail/gestion-talleres-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionTalleresDetail implements CanDeactivate<GestionTalleresDetailComponent>
{
    canDeactivate(
        component: GestionTalleresDetailComponent,
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

        // If the next state doesn't contain '/talleres'
        // it means we are navigating away from the
        // talleres app
        if ( !nextState.url.includes('/gestion-talleres') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another taller...
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

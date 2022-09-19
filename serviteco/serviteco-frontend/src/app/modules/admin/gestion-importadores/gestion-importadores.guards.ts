import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionImportadoresDetailComponent } from './gestion-importadores-detail/gestion-importadores-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionImportadoresDetail implements CanDeactivate<GestionImportadoresDetailComponent>
{
    canDeactivate(
        component: GestionImportadoresDetailComponent,
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

        // If the next state doesn't contain '/importadores'
        // it means we are navigating away from the
        // importadores app
        if ( !nextState.url.includes('/gestion-importadores') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another importador...
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

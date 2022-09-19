import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionRepuestoDetailComponent} from './gestion-repuestos-detail/gestion-repuestos-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionRepuestoDetail implements CanDeactivate<GestionRepuestoDetailComponent>
{
    canDeactivate(
        component: GestionRepuestoDetailComponent,
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

        // If the next state doesn't contain '/repuesto'
        // it means we are navigating away from the
        // repuesto app
        if ( !nextState.url.includes('/gestion-repuestos') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another Repuesto...
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

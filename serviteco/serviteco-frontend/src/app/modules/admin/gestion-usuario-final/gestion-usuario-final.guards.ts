import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionUsuarioFinalDetailComponent } from './gestion-usuario-final-detail/gestion-usuario-final-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionUsuarioFinalDetail implements CanDeactivate<GestionUsuarioFinalDetailComponent>
{
    canDeactivate(
        component: GestionUsuarioFinalDetailComponent,
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

        // If the next state doesn't contain '/usuarioFinal'
        // it means we are navigating away from the
        // usuarioFinal app
        if ( !nextState.url.includes('/gestion-usuario-final') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another usuario...
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

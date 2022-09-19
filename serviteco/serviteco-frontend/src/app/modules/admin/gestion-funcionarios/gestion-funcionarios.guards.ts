import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GestionFuncionarioDetailComponent } from './gestion-funcionarios-detail/gestion-funcionarios-detail.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGestionFuncionarioDetail implements CanDeactivate<GestionFuncionarioDetailComponent>
{
    canDeactivate(
        component: GestionFuncionarioDetailComponent,
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

        // If the next state doesn't contain '/funcionario'
        // it means we are navigating away from the
        // funcionario app
        if ( !nextState.url.includes('/gestion-funcionarios') )
        {
            // Let it navigate
            return true;
        }

        // If we are navigating to another Funcionario...
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

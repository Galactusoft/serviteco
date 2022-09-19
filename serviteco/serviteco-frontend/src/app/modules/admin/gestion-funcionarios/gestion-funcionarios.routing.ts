import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionFuncionarioDetailComponent } from './gestion-funcionarios-detail/gestion-funcionarios-detail.component';
import { GestionFuncionariosListComponent } from './gestion-funcionarios-list/gestion-funcionarios-list.component';
import { GestionFuncionariosComponent } from './gestion-funcionarios.component';
import { CanDeactivateGestionFuncionarioDetail } from './gestion-funcionarios.guards';
import { GestionFuncionariosProductoResolver, GestionFuncionariosResolver } from './gestion-funcionarios.resolvers';

export const funcionariosRoutes: Route[] = [
    {
        path     : '',
        component: GestionFuncionariosComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionFuncionariosListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    funcionarios : GestionFuncionariosResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionFuncionarioDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            funcionarios  : GestionFuncionariosProductoResolver,
                        },
                        canDeactivate: [CanDeactivateGestionFuncionarioDetail]
                    }
                ]
            }
        ]
    }
];

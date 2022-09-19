import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionUsuarioFinalDetailComponent } from './gestion-usuario-final-detail/gestion-usuario-final-detail.component';
import { GestionUsuarioFinalListComponent } from './gestion-usuario-final-list/gestion-usuario-final-list.component';
import { GestionUsuarioFinalComponent } from './gestion-usuario-final.component';
import { CanDeactivateGestionUsuarioFinalDetail } from './gestion-usuario-final.guards';
import { GestionUsuarioFinalResolver, GestionUsuarioFinalUsuarioResolver } from './gestion-usuario-final.resolvers';

export const usuarioFinalRoutes: Route[] = [
    {
        path     : '',
        component: GestionUsuarioFinalComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionUsuarioFinalListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    usuarioFinal : GestionUsuarioFinalResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionUsuarioFinalDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            usuario  : GestionUsuarioFinalUsuarioResolver,
                        },
                        canDeactivate: [CanDeactivateGestionUsuarioFinalDetail]
                    }
                ]
            }
        ]
    }
];

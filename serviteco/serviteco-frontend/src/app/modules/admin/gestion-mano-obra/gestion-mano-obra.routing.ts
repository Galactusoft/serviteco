import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionManoObrasDetailComponent } from './gestion-mano-obra-detail/gestion-mano-obra-detail.component';
import { GestionManoObrasListComponent } from './gestion-mano-obra-list/gestion-mano-obra-list.component';
import { GestionManoObrasComponent } from './gestion-mano-obra.component';
import { CanDeactivateGestionManoObrasDetail } from './gestion-mano-obra.guards';
import { GestionManoObrasResolver, GestionManoObraResolver } from './gestion-mano-obra.resolvers';

export const manoObrasRoutes: Route[] = [
    {
        path     : '',
        component: GestionManoObrasComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionManoObrasListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    manoObras : GestionManoObrasResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionManoObrasDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            manoObra  : GestionManoObraResolver,
                        },
                        canDeactivate: [CanDeactivateGestionManoObrasDetail]
                    }
                ]
            }
        ]
    }
];

import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionDistribuidoresDetailComponent } from './gestion-distribuidores-detail/gestion-distribuidores-detail.component';
import { GestionDistribuidoresListComponent } from './gestion-distribuidores-list/gestion-distribuidores-list.component';
import { GestionDistribuidoresComponent } from './gestion-distribuidores.component';
import { CanDeactivateGestionDistribuidoresDetail } from './gestion-distribuidores.guards';
         
import { GestionDistribuidoresResolver, GestionDistribuidoresDistribuidorResolver } from './gestion-distribuidores.resolvers';

export const distribuidoresRoutes: Route[] = [
    {
        path     : '',
        component: GestionDistribuidoresComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionDistribuidoresListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    distribuidores : GestionDistribuidoresResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionDistribuidoresDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            distribuidor  : GestionDistribuidoresDistribuidorResolver,
                        },
                        canDeactivate: [CanDeactivateGestionDistribuidoresDetail]
                    }
                ]
            }
        ]
    }
];

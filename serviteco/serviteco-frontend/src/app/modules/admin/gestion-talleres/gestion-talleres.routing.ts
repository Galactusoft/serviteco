import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionTalleresDetailComponent } from './gestion-talleres-detail/gestion-talleres-detail.component';
import { GestionTalleresListComponent } from './gestion-talleres-list/gestion-talleres-list.component';
import { GestionTalleresComponent } from './gestion-talleres.component';
import { CanDeactivateGestionTalleresDetail } from './gestion-talleres.guards';
         
import { GestionTalleresResolver, GestionTalleresTallerResolver } from './gestion-talleres.resolvers';

export const talleresRoutes: Route[] = [
    {
        path     : '',
        component: GestionTalleresComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionTalleresListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    talleres : GestionTalleresResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionTalleresDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            taller  : GestionTalleresTallerResolver,
                        },
                        canDeactivate: [CanDeactivateGestionTalleresDetail]
                    }
                ]
            }
        ]
    }
];

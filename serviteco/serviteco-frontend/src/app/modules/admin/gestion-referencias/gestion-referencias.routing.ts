import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionReferenciasDetailComponent } from './gestion-referencias-detail/gestion-referencias-detail.component';
import { GestionReferenciasListComponent } from './gestion-referencias-list/gestion-referencias-list.component';
import { GestionReferenciasComponent } from './gestion-referencias.component';
import { CanDeactivateGestionReferenciaDetail } from './gestion-referencias.guards';
import { GestionReferenciasResolver, GestionReferenciasReferenciaResolver } from './gestion-referencias.resolvers';

export const referenciasRoutes: Route[] = [
    {
        path     : '',
        component: GestionReferenciasComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionReferenciasListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    referencias : GestionReferenciasResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionReferenciasDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            referencias  : GestionReferenciasReferenciaResolver,
                        },
                        canDeactivate: [CanDeactivateGestionReferenciaDetail]
                    }
                ]
            }
        ]
    }
];

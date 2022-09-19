import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionImportadoresDetailComponent } from './gestion-importadores-detail/gestion-importadores-detail.component';
import { GestionImportadoresListComponent } from './gestion-importadores-list/gestion-importadores-list.component';
import { GestionImportadoresComponent } from './gestion-importadores.component';
import { CanDeactivateGestionImportadoresDetail } from './gestion-importadores.guards';
import { GestionImportadoresResolver, GestionImportadoresImportadorResolver } from './gestion-importadores.resolvers';

export const importadoresRoutes: Route[] = [
    {
        path     : '',
        component: GestionImportadoresComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionImportadoresListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    importadores : GestionImportadoresResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionImportadoresDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            importador  : GestionImportadoresImportadorResolver,
                        },
                        canDeactivate: [CanDeactivateGestionImportadoresDetail]
                    }
                ]
            }
        ]
    }
];

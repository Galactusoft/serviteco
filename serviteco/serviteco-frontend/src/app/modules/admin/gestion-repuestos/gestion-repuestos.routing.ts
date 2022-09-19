import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionRepuestoDetailComponent } from './gestion-repuestos-detail/gestion-repuestos-detail.component';
import { GestionrepuestosListComponent } from './gestion-repuestos-list/gestion-repuestos-list.component';
import { GestionRepuestosComponent } from './gestion-repuestos.component';
import { CanDeactivateGestionRepuestoDetail } from './gestion-repuestos.guards';
import { GestionRepuestosResolver, GestionRepuestosProductoResolver } from './gestion-repuestos.resolvers';

export const repuestosRoutes: Route[] = [
    {
        path     : '',
        component: GestionRepuestosComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionrepuestosListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    repuestos : GestionRepuestosResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionRepuestoDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            repuestos  : GestionRepuestosProductoResolver,
                        },
                        canDeactivate: [CanDeactivateGestionRepuestoDetail]
                    }
                ]
            }
        ]
    }
];

import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionTipoProductoDetailComponent } from './gestion-tipoProductos-detail/gestion-tipoProductos-detail.component';
import { GestiontipoProductosListComponent } from './gestion-tipoProductos-list/gestion-tipoProductos-list.component';
import { GestionTipoProductosComponent } from './gestion-tipoProductos.component';
import { CanDeactivateGestionTipoProductoDetail } from './gestion-tipoProductos.guards';
import { GestionTipoProductosResolver, GestionTipoProductosProductoResolver } from './gestion-tipoProductos.resolvers';

export const tipoProductosRoutes: Route[] = [
    {
        path     : '',
        component: GestionTipoProductosComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestiontipoProductosListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    tipoProductos : GestionTipoProductosResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionTipoProductoDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            tipoProductos  : GestionTipoProductosProductoResolver,
                        },
                        canDeactivate: [CanDeactivateGestionTipoProductoDetail]
                    }
                ]
            }
        ]
    }
];

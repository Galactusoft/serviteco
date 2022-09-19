import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionProductosDetailComponent } from './gestion-productos-detail/gestion-productos-detail.component';
import { GestionProductosListComponent } from './gestion-productos-list/gestion-productos-list.component';
import { GestionProductosComponent } from './gestion-productos.component';
import { GestionProductosResolver, GestionproductosProductoResolver } from './gestion-productos.resolvers';

export const productosRoutes: Route[] = [
    {
        path: '',
        component: GestionProductosComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GestionProductosListComponent,
                resolve: {
                    productos: GestionProductosResolver,
                },
            },
            {
                path: ':id',
                component: GestionProductosDetailComponent,
                resolve: {
                    productos: GestionproductosProductoResolver,
                }
            }
        ]
    }
];

export const registroProductoRoutes: Route[] = [
    {
        path: '',
        component: GestionProductosDetailComponent,
        resolve: {
            productos: GestionProductosResolver,
        },
    }
];

import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionContactenosDetailComponent } from './gestion-contactenos-detail/gestion-contactenos-detail.component';
import { GestionContactenosListComponent } from './gestion-contactenos-list/gestion-contactenos-list.component';
import { GestionContactenosComponent } from './gestion-contactenos.component';
import { GestionContactenosResolver, GestionContactenossContactenosResolver } from './gestion-contactenos.resolvers';

export const contactenosRoutes: Route[] = [
    {
        path: '',
        component: GestionContactenosComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GestionContactenosListComponent,
                resolve: {
                    productos: GestionContactenosResolver,
                },
            },
            {
                path: ':id',
                component: GestionContactenosDetailComponent,
                resolve: {
                    productos: GestionContactenossContactenosResolver,
                }
            }
        ]
    }
];

export const registroContactenosRoutes: Route[] = [
    {
        path: '',
        component: GestionContactenosDetailComponent,
        resolve: {
            productos: GestionContactenosResolver,
        },
    }
];

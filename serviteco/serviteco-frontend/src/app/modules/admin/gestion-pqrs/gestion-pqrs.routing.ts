import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionPqrsDetailComponent } from './gestion-pqrs-detail/gestion-pqrs-detail.component';
import { GestionPqrsListComponent } from './gestion-pqrs-list/gestion-pqrs-list.component';
import { GestionPqrsComponent } from './gestion-pqrs.component';
import { GestionPqrsResolver, GestionPqrssPqrsResolver } from './gestion-pqrs.resolvers';

export const pqrsRoutes: Route[] = [
    {
        path: '',
        component: GestionPqrsComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GestionPqrsListComponent,
                resolve: {
                    productos: GestionPqrsResolver,
                },
            },
            {
                path: ':id',
                component: GestionPqrsDetailComponent,
                resolve: {
                    productos: GestionPqrssPqrsResolver,
                }
            }
        ]
    }
];

export const registroPqrsRoutes: Route[] = [
    {
        path: '',
        component: GestionPqrsDetailComponent,
        resolve: {
            productos: GestionPqrsResolver,
        },
    }
];

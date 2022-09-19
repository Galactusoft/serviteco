import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionAyudaDetailComponent } from './gestion-ayuda-detail/gestion-ayuda-detail.component';
import { GestionAyudaListComponent } from './gestion-ayuda-list/gestion-ayuda-list.component';
import { GestionAyudaComponent } from './gestion-ayuda.component';
import { GestionAyudaResolver, GestionayudasAyudaResolver } from './gestion-ayuda.resolvers';

export const ayudaRoutes: Route[] = [
    {
        path: '',
        component: GestionAyudaComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: GestionAyudaListComponent,
                resolve: {
                    productos: GestionAyudaResolver,
                },
            },
            {
                path: ':id',
                component: GestionAyudaDetailComponent,
                resolve: {
                    productos: GestionayudasAyudaResolver,
                }
            }
        ]
    }
];

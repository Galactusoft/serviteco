import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionCargaMasivaDetailComponent } from './gestion-carga-masiva-detail/gestion-carga-masiva-detail.component';
import { GestionCargaMasivaComponent } from './gestion-carga-masiva.component';

export const gestionCargaMasivaRoutes: Route[] = [
    {
        path     : '',
        component: GestionCargaMasivaComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: GestionCargaMasivaDetailComponent
            }
        ]
    }
];

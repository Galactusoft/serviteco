import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionMarcasDetailComponent } from './gestion-marcas-detail/gestion-marcas-detail.component';
import { GestionMarcasListComponent } from './gestion-marcas-list/gestion-marcas-list.component';
import { GestionMarcasComponent } from './gestion-marcas.component';
import { CanDeactivateGestionMarcasDetail } from './gestion-marcas.guards';
import { GestionMarcasResolver, GestionMarcasMarcaResolver } from './gestion-marcas.resolvers';

export const marcasRoutes: Route[] = [
    {
        path     : '',
        component: GestionMarcasComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionMarcasListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    marcas : GestionMarcasResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionMarcasDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            marca  : GestionMarcasMarcaResolver,
                        },
                        canDeactivate: [CanDeactivateGestionMarcasDetail]
                    }
                ]
            }
        ]
    }
];

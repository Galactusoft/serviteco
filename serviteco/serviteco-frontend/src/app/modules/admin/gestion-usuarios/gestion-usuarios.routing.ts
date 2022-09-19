import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionUsuariosDetailComponent } from './gestion-usuarios-detail/gestion-usuarios-detail.component';
import { GestionUsuariosListComponent } from './gestion-usuarios-list/gestion-usuarios-list.component';
import { GestionUsuariosComponent } from './gestion-usuarios.component';
import { CanDeactivateGestionUsuariosDetail } from './gestion-usuarios.guards';
import { GestionUsuariosResolver, GestionUsuariosUsuarioResolver } from './gestion-usuarios.resolvers';

export const usuariosRoutes: Route[] = [
    {
        path     : '',
        component: GestionUsuariosComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionUsuariosListComponent,
                canActivate: [AuthGuard],
                resolve  : {
                    usuarios : GestionUsuariosResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : GestionUsuariosDetailComponent,
                        canActivate: [AuthGuard],
                        resolve      : {
                            usuario  : GestionUsuariosUsuarioResolver,
                        },
                        canDeactivate: [CanDeactivateGestionUsuariosDetail]
                    }
                ]
            }
        ]
    }
];

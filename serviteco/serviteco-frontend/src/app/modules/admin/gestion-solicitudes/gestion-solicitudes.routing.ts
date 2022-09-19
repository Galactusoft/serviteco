import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { ScrumboardBoardComponent } from './board/board.component';
import { GestionSolicitudesDetailComponent } from './gestion-solicitudes-detail/gestion-solicitudes-detail.component';
import { GestionSolicitudesListComponent } from './gestion-solicitudes-list/gestion-solicitudes-list.component';
import { GestionSolicitudesComponent } from './gestion-solicitudes.component';
import { GestionSolicitudesPanelResolver, GestionSolicitudesResolver, GestionSolicitudesSolicitudesResolver } from './gestion-solicitudes.resolvers';

export const gestionSolicitudesRoutes: Route[] = [
    {
        path     : '',
        component: GestionSolicitudesComponent,
        canActivate: [AuthGuard],
        children : [
            {
                path     : '',
                component: GestionSolicitudesListComponent,
                resolve  : {
                    courses: GestionSolicitudesResolver
                }
            },
            {
                path     : 'board',
                component: ScrumboardBoardComponent,
                resolve  : {
                    courses: GestionSolicitudesPanelResolver
                }
            },
            {
                path     : ':id',
                component: GestionSolicitudesDetailComponent
                ,
                resolve  : {
                    course: GestionSolicitudesSolicitudesResolver
                }
            }
        ]
    }
];

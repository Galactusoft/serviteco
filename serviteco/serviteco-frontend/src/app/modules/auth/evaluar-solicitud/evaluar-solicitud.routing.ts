import { Route } from '@angular/router';
import { EvaluarSolicitudComponent } from './evaluar-solicitud.component';
import { EvaluarSolicitudSolicitudResolver } from './evaluar-solicitud.resolvers';

export const evaluarSolicitudRoutes: Route[] = [
    {
        path     : ':id',
        component: EvaluarSolicitudComponent,
        resolve  : {
            course: EvaluarSolicitudSolicitudResolver
        }
    }
];

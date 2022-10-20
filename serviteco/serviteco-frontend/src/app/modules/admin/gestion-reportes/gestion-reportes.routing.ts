import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionReportesComponent } from './gestion-reportes.component';
import { GestionReportesImportadoresComponent } from './importadores/gestion-reportes-importadores.component';
import { GestionReportesDistribuidoresComponent } from './distribuidores/gestion-reportes-distribuidores.component';

export const reportesRoutes: Route[] = [
    {
        path: '',
        component: GestionReportesComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'importador',
                pathMatch: 'full',
                component: GestionReportesImportadoresComponent,
            },
            {
                path: 'distribuidor',
                pathMatch: 'full',
                component: GestionReportesDistribuidoresComponent,
            },
        ]
    }
];


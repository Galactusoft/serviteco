import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionReportesComponent } from './gestion-reportes.component';
import { ReporteCuentasCobrarImportadorComponent } from './reporte-cuentas-cobrar-importador/reporte-cuentas-cobrar-importador.component';
import { ReporteProductosComponent } from './reporte-productos-creados/reporte-productos.component';

export const reportesRoutes: Route[] = [
    {
        path: '',
        component: GestionReportesComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'cuentas-cobrar-importador',
                pathMatch: 'full',
                component: ReporteCuentasCobrarImportadorComponent,
            },
            {
                path: 'productos-creados',
                pathMatch: 'full',
                component: ReporteProductosComponent,
            },
        ]
    }
];


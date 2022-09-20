import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionReportesComponent } from './gestion-reportes.component';
import { ReporteCuentasCobrarImportadorComponent } from './importadores/reporte-cuentas-cobrar-importador/reporte-cuentas-cobrar-importador.component';
import { ReporteDistribuidoresTalleresActivosComponent } from './importadores/reporte-distribuidores-talleres-activos/reporte-distribuidores-talleres-activos.component';
import { ReporteProductosActivosComponent } from './importadores/reporte-productos-activos/reporte-productos-activos.component';
import { ReporteProductosComponent } from './importadores/reporte-productos-creados/reporte-productos.component';
import { ReporteReferenciasActivasComponent } from './importadores/reporte-referencias-activas/reporte-referencias-activas.component';

export const reportesRoutes: Route[] = [
    {
        path: '',
        component: GestionReportesComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'importadores/cuentas-cobrar-importador',
                pathMatch: 'full',
                component: ReporteCuentasCobrarImportadorComponent,
            },
            {
                path: 'importadores/productos-creados',
                pathMatch: 'full',
                component: ReporteProductosComponent,
            },
            {
                path: 'importadores/distribuidores-talleres-activos',
                pathMatch: 'full',
                component: ReporteDistribuidoresTalleresActivosComponent,
            },
            {
                path: 'importadores/referencias-activas',
                pathMatch: 'full',
                component: ReporteReferenciasActivasComponent,
            },
            {
                path: 'importadores/productos-activos',
                pathMatch: 'full',
                component: ReporteProductosActivosComponent,
            },
        ]
    }
];


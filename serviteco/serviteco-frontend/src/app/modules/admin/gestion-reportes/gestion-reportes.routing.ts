import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { GestionReportesComponent } from './gestion-reportes.component';
import { ReporteDistribuidoresTalleresActivosComponent } from './importadores/reporte-distribuidores-talleres-activos/reporte-distribuidores-talleres-activos.component';
import { ReporteProductosActivosComponent } from './importadores/reporte-productos-activos/reporte-productos-activos.component';
import { ReporteProductosComponent } from './importadores/reporte-productos-creados/reporte-productos.component';
import { ReporteReferenciasActivasComponent } from './importadores/reporte-referencias-activas/reporte-referencias-activas.component';
import { ReporteUsuariosActivosComponent } from './importadores/reporte-usuarios-activos/reporte-usuarios-activos.component';
import { ReporteRepuestosActivosComponent } from './importadores/reporte-repuestos-activos/reporte-repuestos-activos.component';
import { ReporteSolicitudGarantiasComponent } from './importadores/reporte-solicitud-garantias/reporte-solicitud-garantias.component';
import { ReporteReferenciasMasGarantiasComponent } from './importadores/reporte-referencias-mas-garantias/reporte-referencias-mas-garantias.component';
import { GestionReportesImportadoresComponent } from './importadores/gestion-reportes-importadores.component';

export const reportesRoutes: Route[] = [
    {
        path: '',
        component: GestionReportesComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'importadores/cuentas-cobrar-importador',
                pathMatch: 'full',
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
                path: 'importadores/solicitud-garantias',
                pathMatch: 'full',
                component: ReporteSolicitudGarantiasComponent,
            },
            {
                path: 'importadores/repuestos-activos',
                pathMatch: 'full',
                component: ReporteRepuestosActivosComponent,
            },
            {
                path: 'importadores/usuarios-activos',
                pathMatch: 'full',
                component: ReporteUsuariosActivosComponent,
            },
            {
                path: 'importadores/productos-activos',
                pathMatch: 'full',
                component: ReporteProductosActivosComponent,
            },
            {
                path: 'importadores/referencias-mas-garantias',
                pathMatch: 'full',
                component: ReporteReferenciasMasGarantiasComponent,
            },
            {
                path: 'importador',
                pathMatch: 'full',
                component: GestionReportesImportadoresComponent,
            },
        ]
    }
];


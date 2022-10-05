import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseCardModule } from '@fuse/components/card';
import { reportesRoutes } from './gestion-reportes.routing';
import { GestionReportesComponent } from './gestion-reportes.component';
import { ReporteCuentasPagarImportadorComponent } from './importadores/reporte-cuentas-pagar-importador/reporte-cuentas-pagar-importador.component';
import { GestionReporteService } from './gestion-reportes.service';
import { ReporteProductosComponent } from './importadores/reporte-productos-creados/reporte-productos.component';
import { ReporteDistribuidoresTalleresActivosComponent } from './importadores/reporte-distribuidores-talleres-activos/reporte-distribuidores-talleres-activos.component';
import {MatTabsModule} from '@angular/material/tabs';
import { ReporteReferenciasActivasComponent } from './importadores/reporte-referencias-activas/reporte-referencias-activas.component';
import { ReporteProductosActivosComponent } from './importadores/reporte-productos-activos/reporte-productos-activos.component';
import { ReporteUsuariosActivosComponent } from './importadores/reporte-usuarios-activos/reporte-usuarios-activos.component';
import { ReporteRepuestosActivosComponent } from './importadores/reporte-repuestos-activos/reporte-repuestos-activos.component';
import { ReporteSolicitudGarantiasComponent } from './importadores/reporte-solicitud-garantias/reporte-solicitud-garantias.component';
import { ReporteReferenciasMasGarantiasComponent } from './importadores/reporte-referencias-mas-garantias/reporte-referencias-mas-garantias.component';
import { GestionReportesImportadoresComponent } from './importadores/gestion-reportes-importadores.component';
import { BuscadorDistribuidoresImportadorComponent } from '../buscadores/buscador-distribuidores-importador/buscador-distribuidores-importador.component';
import { ReporteRepuestosSolicitadosComponent } from './importadores/reporte-repuestos-solicitados/reporte-repuestos-solicitados.component';
import { ReporteManoObraCostosComponent } from './importadores/reporte-mano-obra-costos/reporte-mano-obra-costos.component';
import { ReporteAdquisicionEquiposComponent } from './importadores/reporte-adquisicion-equipos/reporte-adquisicion-equipos.component';
import { ReporteColocacionMercadoComponent } from './importadores/reporte-colocacion-mercado/reporte-colocacion-mercado.component';
import { ReporteSerialesBodegaComponent } from './importadores/reporte-seriales-bodega/reporte-seriales-bodega.component';
import { ReporteGraficoImportadorComponent } from './importadores/reporte-grafico-importador/reporte-grafico-importador.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
@NgModule({
    declarations: [
        GestionReportesComponent,
        GestionReportesImportadoresComponent,
        ReporteCuentasPagarImportadorComponent,
        ReporteProductosComponent,
        ReporteDistribuidoresTalleresActivosComponent,
        ReporteReferenciasActivasComponent,
        ReporteProductosActivosComponent,
        ReporteUsuariosActivosComponent,
        ReporteRepuestosActivosComponent,
        ReporteSolicitudGarantiasComponent,
        ReporteReferenciasMasGarantiasComponent,
        BuscadorDistribuidoresImportadorComponent,
        ReporteRepuestosSolicitadosComponent,
        ReporteManoObraCostosComponent,
        ReporteAdquisicionEquiposComponent,
        ReporteColocacionMercadoComponent,
        ReporteSerialesBodegaComponent,
        ReporteGraficoImportadorComponent
    ],
    imports     : [
        RouterModule.forChild(reportesRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        FuseCardModule,
        MatTabsModule,
        MatButtonToggleModule,
        NgApexchartsModule,
    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse  : {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput         : 'LL',
                    monthYearLabel    : 'MMM YYYY',
                    dateA11yLabel     : 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ],
    entryComponents: [
        GestionReporteService,
        BuscadorDistribuidoresImportadorComponent
    ],
})
export class GestionReportesModule
{
}

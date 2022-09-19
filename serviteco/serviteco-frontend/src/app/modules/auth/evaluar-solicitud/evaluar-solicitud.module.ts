import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import { evaluarSolicitudRoutes } from './evaluar-solicitud.routing';
import { EvaluarSolicitudComponent } from './evaluar-solicitud.component';
import { GestionSolicitudesModule } from 'app/modules/admin/gestion-solicitudes/gestion-solicitudes.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { GestionSolicitudesDetailComponent } from 'app/modules/admin/gestion-solicitudes/gestion-solicitudes-detail/gestion-solicitudes-detail.component';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
    declarations: [
        EvaluarSolicitudComponent,
        GestionSolicitudesDetailComponent
    ],
    imports     : [
        RouterModule.forChild(evaluarSolicitudRoutes),
        MatButtonModule,
        FuseCardModule,
        SharedModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,
        MatSnackBarModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatDividerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatStepperModule,
        FuseCardModule,
    ]
})
export class EvaluarSolicitudModule
{
}

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { GestionSolicitudesComponent } from './gestion-solicitudes.component';
import { GestionSolicitudesListComponent } from './gestion-solicitudes-list/gestion-solicitudes-list.component';
import { gestionSolicitudesRoutes } from './gestion-solicitudes.routing';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { FuseCardModule } from '@fuse/components/card';
import { BuscadorRepuestosComponent } from '../buscadores/buscador-repuestos/buscador-repuestos.component';
import { BuscadorManoObraComponent } from '../buscadores/buscador-mano-obra/buscador-mano-obra.component';
import { BuscadorFuncionariosComponent } from '../buscadores/buscador-funcionarios/buscador-funcionarios.component';
import { ScrumboardBoardComponent } from './board/board.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
    declarations: [
        GestionSolicitudesComponent,
        GestionSolicitudesListComponent,
        BuscadorRepuestosComponent,
        ScrumboardBoardComponent,
        BuscadorManoObraComponent
    ],
    imports     : [
        RouterModule.forChild(gestionSolicitudesRoutes),
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
        DragDropModule,
        MatMenuModule
    ],
    entryComponents: [
        BuscadorRepuestosComponent,
        BuscadorManoObraComponent,
        BuscadorFuncionariosComponent
    ],
})
export class GestionSolicitudesModule
{
}

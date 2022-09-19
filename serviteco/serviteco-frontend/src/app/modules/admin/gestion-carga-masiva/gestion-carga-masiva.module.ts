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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { FuseCardModule } from '@fuse/components/card';
import { GestionCargaMasivaComponent } from './gestion-carga-masiva.component';
import { gestionCargaMasivaRoutes } from './gestion-carga-masiva.routing';
import { GestionCargaMasivaDetailComponent } from './gestion-carga-masiva-detail/gestion-carga-masiva-detail.component';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { BuscadorProductosComponent } from '../buscadores/buscador-productos/buscador-productos.component';


@NgModule({
    declarations: [
        GestionCargaMasivaComponent,
        GestionCargaMasivaDetailComponent,
        BuscadorProductosComponent
    ],
    imports     : [
        RouterModule.forChild(gestionCargaMasivaRoutes),
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
        FuseHighlightModule,
    ],
    entryComponents: [
        BuscadorProductosComponent
    ],
})
export class GestionCargaMasivaModule
{
}

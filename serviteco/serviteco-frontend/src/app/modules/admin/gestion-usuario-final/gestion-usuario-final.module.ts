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
import { BuscadorFuncionariosComponent } from '../buscadores/buscador-funcionarios/buscador-funcionarios.component';
import { BuscadorTalleresComponent } from '../buscadores/buscador-talleres/buscador-talleres.component';
import { GestionUsuarioFinalComponent } from './gestion-usuario-final.component';
import { GestionUsuarioFinalListComponent } from './gestion-usuario-final-list/gestion-usuario-final-list.component';
import { GestionUsuarioFinalDetailComponent } from './gestion-usuario-final-detail/gestion-usuario-final-detail.component';
import { usuarioFinalRoutes } from './gestion-usuario-final.routing';
import { DialogMapaComponent } from '../buscadores/dialog-mapa/dialog-mapa.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'environments/environment';

@NgModule({
    declarations: [
        GestionUsuarioFinalComponent,
        GestionUsuarioFinalListComponent,
        GestionUsuarioFinalDetailComponent
    ],
    imports     : [
        RouterModule.forChild(usuarioFinalRoutes),
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
        MatIconModule,
        AgmCoreModule.forRoot({
            apiKey: environment.API_KEY_GOOGLE_MAPS
        }),
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
        BuscadorFuncionariosComponent,
        BuscadorTalleresComponent,
        DialogMapaComponent
    ],
})
export class GestionUsuarioFinalModule
{
}

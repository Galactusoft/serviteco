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
import { GestionRepuestosComponent } from './gestion-repuestos.component';
import { GestionrepuestosListComponent } from './gestion-repuestos-list/gestion-repuestos-list.component';

import { GestionRepuestoDetailComponent } from './gestion-repuestos-detail/gestion-repuestos-detail.component';
import { repuestosRoutes} from './gestion-repuestos.routing';
import { BuscadorMarcasComponent } from '../buscadores/buscador-marcas/buscador-marcas.component';
import { BuscadorCategoriasComponent } from '../buscadores/buscador-categorias/buscador-categorias.component';

@NgModule({
    declarations: [
        GestionRepuestosComponent,
        GestionrepuestosListComponent,
        GestionRepuestoDetailComponent,
        BuscadorMarcasComponent,
        BuscadorCategoriasComponent
    ],
    imports     : [
        RouterModule.forChild(repuestosRoutes),
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
        BuscadorMarcasComponent,
        BuscadorCategoriasComponent
    ],
})
export class GestionRepuestosModule
{
}

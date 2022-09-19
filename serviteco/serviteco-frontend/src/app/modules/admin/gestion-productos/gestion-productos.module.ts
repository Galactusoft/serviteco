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
import { GestionProductosComponent } from './gestion-productos.component';
import { GestionProductosListComponent } from './gestion-productos-list/gestion-productos-list.component';

import { GestionProductosDetailComponent } from './gestion-productos-detail/gestion-productos-detail.component';
import { productosRoutes} from './gestion-productos.routing';
import { BuscadorImportadorasComponent } from '../buscadores/buscador-importador/buscador-importador.component';
import { BuscadorReferenciasComponent } from '../buscadores/buscador-referencias/buscador-referencias.component';
import { FuseCardModule } from '@fuse/components/card';
import { BuscadorDistribuidoresComponent } from '../buscadores/buscador-distribuidor/buscador-distribuidor.component';
import { DialogMapaComponent } from '../buscadores/dialog-mapa/dialog-mapa.component';
import { BuscadorUsuariosComponent } from '../buscadores/buscador-usuarios/buscador-usuarios.component';
import { BuscadorMarcasImportadorComponent } from '../buscadores/buscador-marcas-importador/buscador-marcas-importador.component';
import { DialogUsuarioFinalComponent } from '../buscadores/dialog-usuario-final/dialog-usuario-final.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'environments/environment';

@NgModule({
    declarations: [
        GestionProductosComponent,
        GestionProductosListComponent,
        GestionProductosDetailComponent,
        BuscadorImportadorasComponent,
        BuscadorReferenciasComponent,
        BuscadorDistribuidoresComponent,
        BuscadorUsuariosComponent,
        BuscadorMarcasImportadorComponent,
        DialogUsuarioFinalComponent
    ],
    imports     : [
        RouterModule.forChild(productosRoutes),
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
        BuscadorImportadorasComponent,
        BuscadorReferenciasComponent,
        BuscadorDistribuidoresComponent,
        BuscadorMarcasImportadorComponent,
        DialogMapaComponent,
        DialogUsuarioFinalComponent,
    ],
})
export class GestionProductosModule
{
}

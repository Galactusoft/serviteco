import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { FuseCardModule } from '@fuse/components/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { GestionPoliticaGarantiaComponent } from './gestion-politica-garantia.component';
import { gestionPoliticaGarantiaRoutes } from './gestion-politica-garantia.routing';

@NgModule({
    declarations: [
        GestionPoliticaGarantiaComponent
    ],
    imports     : [
        RouterModule.forChild(gestionPoliticaGarantiaRoutes),
        CdkScrollableModule,
        FuseCardModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        FuseFindByKeyPipeModule,
        SharedModule,
    ]
})
export class GestionPoliticaGarantiaModule
{
}

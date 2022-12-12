import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericDataTableComponent } from './generic-data-table/generic-data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NumberOnlyDirective } from './number-only.directive';
import { GestionReportesService } from './gestion-reportes.service';
import { AlphaNumericOnlyDirective } from './alpha-numeric-only.directive';

@NgModule({
    declarations: [
        GenericDataTableComponent,
        NumberOnlyDirective,
        AlphaNumericOnlyDirective
      ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        MatButtonModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GenericDataTableComponent,
        NumberOnlyDirective,
        AlphaNumericOnlyDirective
    ]
})
export class SharedModule {
    static forRoot() {
      return {
        ngModule: SharedModule,
        providers: [
            GestionReportesService
        ] /* Agregar los providers aquí, no arriba en el decorate*/,
      };
    }
  }

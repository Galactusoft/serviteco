import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-reportes',
    templateUrl    : './gestion-reportes.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionReportesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

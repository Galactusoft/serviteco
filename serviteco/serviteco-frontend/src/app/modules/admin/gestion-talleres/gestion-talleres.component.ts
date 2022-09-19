import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-talleres',
    templateUrl    : './gestion-talleres.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionTalleresComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

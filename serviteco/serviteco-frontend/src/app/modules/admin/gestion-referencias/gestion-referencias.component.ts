import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-referencias',
    templateUrl    : './gestion-referencias.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionReferenciasComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

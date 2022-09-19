import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-manoObra',
    templateUrl    : './gestion-mano-obra.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionManoObrasComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

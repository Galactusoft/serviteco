import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-distribuidores',
    templateUrl    : './gestion-distribuidores.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionDistribuidoresComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

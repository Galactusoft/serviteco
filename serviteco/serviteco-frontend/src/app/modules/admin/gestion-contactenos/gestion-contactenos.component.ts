import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-contactenos',
    templateUrl    : './gestion-contactenos.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionContactenosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

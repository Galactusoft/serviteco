import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-ayuda',
    templateUrl    : './gestion-ayuda.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionAyudaComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-productos',
    templateUrl    : './gestion-productos.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionProductosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-repuestos',
    templateUrl    : './gestion-repuestos.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionRepuestosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

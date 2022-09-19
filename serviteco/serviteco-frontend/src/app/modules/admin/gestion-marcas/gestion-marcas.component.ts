import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-marcas',
    templateUrl    : './gestion-marcas.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionMarcasComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

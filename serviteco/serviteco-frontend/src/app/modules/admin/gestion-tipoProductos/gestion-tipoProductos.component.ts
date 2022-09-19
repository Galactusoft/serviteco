import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-tipoProductos',
    templateUrl    : './gestion-tipoProductos.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionTipoProductosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

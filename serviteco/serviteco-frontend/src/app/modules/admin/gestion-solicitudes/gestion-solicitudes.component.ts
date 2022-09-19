import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-solicitudes',
    templateUrl    : './gestion-solicitudes.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionSolicitudesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

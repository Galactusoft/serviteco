import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-usuarios',
    templateUrl    : './gestion-usuarios.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuariosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

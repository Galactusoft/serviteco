import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-usuario-final',
    templateUrl    : './gestion-usuario-final.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionUsuarioFinalComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

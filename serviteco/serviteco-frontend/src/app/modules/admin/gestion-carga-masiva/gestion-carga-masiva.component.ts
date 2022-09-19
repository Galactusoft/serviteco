import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-carga-masiva',
    templateUrl    : './gestion-carga-masiva.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionCargaMasivaComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

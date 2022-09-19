import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-importadores',
    templateUrl    : './gestion-importadores.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionImportadoresComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

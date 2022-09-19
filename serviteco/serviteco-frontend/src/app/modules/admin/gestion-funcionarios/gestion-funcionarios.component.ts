import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-funcionarios',
    templateUrl    : './gestion-funcionarios.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionFuncionariosComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

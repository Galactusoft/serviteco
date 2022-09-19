import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'gestion-pqrs',
    templateUrl    : './gestion-pqrs.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestionPqrsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

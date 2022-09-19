import { Component, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector     : 'evaluar-solicitud',
    templateUrl  : './evaluar-solicitud.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class EvaluarSolicitudComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

export class TipoSolicitud {
    id: string;
    nombre: string;
    estado: string;

    /**
     * Constructor
     *
     * @param tipoSolicitud
     */
    constructor(tipoSolicitud?) {
        {
            this.id = tipoSolicitud?.id || null;
        }
    }
}

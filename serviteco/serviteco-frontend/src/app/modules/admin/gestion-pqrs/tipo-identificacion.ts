export class TipoIdentificacion {
    id: string;
    nombre: string;
    estado: string;

    /**
     * Constructor
     *
     * @param tipoIdentificacion
     */
    constructor(tipoIdentificacion?) {
        {
            this.id = tipoIdentificacion?.id || null;
        }
    }
}


export class Ubicacion {
    id: string;
    lat: number;
    lon: number;

    /**
     * Constructor
     *
     * @param ubicacion
     */
    constructor(ubicacion?) {
        {
            this.id = ubicacion?.id || null;
        }
    }
}
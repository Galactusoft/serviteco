export class ManoObra {
    id: string; 
    nombre: string;
    descripcion: string;
    valor_unitario: number;
    cantidad: number;
    observaciones: string;
    horas: number;
    total: number;
    estado:string;
    /**
     * Constructor
     *
     * @param mano-obra
     */
    constructor(manoObra?) {
        {
            this.id = manoObra?.id || null;
        }
    }
}
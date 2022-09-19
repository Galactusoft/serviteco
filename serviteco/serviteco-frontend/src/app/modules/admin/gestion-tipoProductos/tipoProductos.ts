
export class TipoProducto {
    id: string;
    nombre: string;
    descripcion: string;
    estado:string;
   

    /**
     * Constructor
     *
     * @param tipoProducto
     */
    constructor(tipoProducto?) {
        {
            this.id = tipoProducto?.id || null;
        }
    }
}
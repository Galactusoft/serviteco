import { Importador } from "../gestion-importadores/importadores";

export class Marca {
    id: string; 
    nombre: string;
    descripcion: string;
    foto: string;
    imagen: string;
    estado:string;
    /**
     * Constructor
     *
     * @param marca
     */
    constructor(marca?) {
        {
            this.id = marca?.id || null;
        }
    }
}

export class MarcaImportador {
    registros: Marca[];
    cantidad: number;
}
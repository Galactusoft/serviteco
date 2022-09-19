import { Importador } from "../gestion-importadores/importadores";

export class Referencia {
    id: string;
    nombre: string;
    descripcion: string;
    id_tipo_producto: string;
    nombre_tipo_producto: string;
    id_importador: string;
    nombre_importador: string;
    id_marca: string;
    nombre_marca: string
    estado: string;
    imagen: string;

    /**
     * Constructor
     *
     * @param referencia
     */
    constructor(referencia?) {
        {
            this.id = referencia?.id || null;
        }
    }
}

export class ReferenciasMarca {
    registros: Referencia[];
    cantidad: number;
}

export class ReferenciasPaginator {
    registros: Referencia[];
    cantidad: number;
}

export class ReferenciasImportador {
    registros: Importador[];
    cantidad: number;
}
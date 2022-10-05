import { Marca } from "../gestion-marcas/marcas";
import { Referencia } from "../gestion-referencias/referencias";

export class Repuesto {
    id: string;
    material: string;
    pieza_fabricante: string;
    nombre: string;
    descripcion: string;
    valor_unitario: number;
    cantidad: number;
    observaciones: string;
    total: number;
    estado: string;
    id_marca: string;
    nombre_marca: string;


    /**
     * Constructor
     *
     * @param repuesto
     */
    constructor(repuesto?) {
        {
            this.id = repuesto?.id || null;
        }
    }
}

export class RepuestoPaginator {
    registros: Repuesto[];
    cantidad: number;
}

export class RepuestoMarca {
    registros: Marca[];
    cantidad: number;
}

export class RepuestoReferencias {
    registros: Referencia[];
    cantidad: number;
}

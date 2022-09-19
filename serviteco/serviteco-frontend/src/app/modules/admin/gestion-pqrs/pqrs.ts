export class Pqrs {
    id: string;
    uuid: string;
    id_tipo_solicitud: string;
    tipo_solicitud: string;
    id_tipo_identificacion: string;
    tipo_identificacion: string;
    identificacion: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    mensaje: string;
    serial: string;

    /**
     * Constructor
     *
     * @param producto
     */
    constructor(producto?) {
        {
            this.id = producto?.id || null;
        }
    }
}

export class PqrsPaginator {
    registros: Pqrs[];
    cantidad: number;
}

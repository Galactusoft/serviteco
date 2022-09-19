export class Contactenos {
    id: string;
    id_tipo_identificacion: string;
    tipo_identificacion: string;
    identificacion: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    mensaje: string;
    respuesta: string;

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

export class ContactenosPaginator {
    registros: Contactenos[];
    cantidad: number;
}

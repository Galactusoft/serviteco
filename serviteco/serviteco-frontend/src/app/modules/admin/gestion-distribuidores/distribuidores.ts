export class Distribuidor {
    id: string; 
    nit:String;
    nombre: string;
    estado:string;
    direccion:string;
    telefono:string;
    correo:string;
    correo_contabilidad;
    foto: string;
    imagen: string;
    latitud: string = '';
    longitud: string = '';
    /**
     * Constructor
     *
     * @param distribuidor
     */
    constructor(distribuidor?) {
        {
            this.id = distribuidor?.id || null;
        }
    }
}

export class DistribuidorOrganigrama {
    id: string;
    nombre: string;
    id_importador: string;
    imagen: string;
}
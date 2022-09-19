export class Talleres {
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
     * @param talleres
     */
    constructor(talleres?) {
        {
            this.id = talleres?.id || null;
        }
    }
}

export class TalleresOrganigrama {
    id: string;
    nombre: string;
    id_importador: string;
    imagen: string;
}
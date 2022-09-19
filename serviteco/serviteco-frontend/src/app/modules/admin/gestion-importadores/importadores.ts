export class Importador {
    id: string; 
    nit:String;
    nombre: string;
    descripcion: string;
    estado:string;
    direccion:string;
    telefono:string;
    correo:string;
    correo_contabilidad;
    foto: string;
    imagen: string;
    /**
     * Constructor
     *
     * @param importador
     */
    constructor(importador?) {
        {
            this.id = importador?.id || null;
        }
    }
}


export class ImportadorOrganigrama {
    id: string;
    nombre: string;
    id_importador: string;
    imagen: string;
}
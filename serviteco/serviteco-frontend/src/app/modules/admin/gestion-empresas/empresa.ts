export class Empresa {
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
     * @param empresa
     */
    constructor(empresa?) {
        {
            this.id = empresa?.id || null;
        }
    }
}
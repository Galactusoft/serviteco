export class Usuario {
    id: string;
    username: string;
    password: string;
    nombre_completo: string;
    identificacion: string;
    correo: string;
    telefono: string;
    cargo: string;
    jefe_taller: string;
    tipo_usuario: string;
    tipo_funcionario: string;
    id_importador: string;
    nombre_importador: string;
    id_distribuidor: string;
    nombre_distribuidor: string;
    id_funcionario: string;
    id_taller: string;
    nombre_taller: string;
    estado: string;
    fecha_sistema: string;
    company: string;

    /**
     * Constructor
     *
     * @param usuario
     */
    constructor(usuario?) {
        {
            this.id = usuario?.id || null;
        }
    }
}